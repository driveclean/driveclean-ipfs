import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import { Cluster, clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, transferChecked } from "@solana/spl-token";
import { getBalance } from "./get";
import prisma from "@lib/prisma";
import { SOURCE_WITHDRAW, TX_TYPE_WITHDRAW } from "@constants/token";
import { Decimal } from "@prisma/client/runtime";
import { updateBalanceTX } from "@lib/api/balance/balance";

export interface WithdrawBalanceReq {
  amount?: string;
}

// body的校验规则
const dataSchema = Joi.object<WithdrawBalanceReq>({
  amount: Joi.string().required(),
});

const handler = async (req: ApiRequest<null, WithdrawBalanceReq>, resp: NextApiResponse) => {
  try {
    // 格式化提现金额
    let amount: Decimal;
    try {
      amount = new Decimal(req.data.amount);
    } catch (e) {
      resp.statusCode = 400;
      throw new Error("bad amount");
    }

    // 校验提现金额，最少0.01
    if (amount.lt(0.01)) {
      resp.statusCode = 400;
      throw new Error("bad amount");
    }

    // 获取用户拥有的余额
    const balance = await getBalance(req.user.mid);

    // 判断是否有足够的余额
    if (amount.greaterThan(balance)) {
      logger.warnc(req, `user: ${req.user.mid} withdraw balance: ${amount} but only: ${balance}`);
      resp.statusCode = 400;
      throw new Error("bad amount");
    }

    // 创建一个solana连接
    const connection = new Connection(clusterApiUrl(process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster), "confirmed");
    // 从这个wallet支付gas费用
    const feePayerWallet = Keypair.fromSecretKey(base58.decode(process.env.SOLANA_FEE_PAYER_WALLET));
    // 从这个wallet转出spl token
    const fromWallet = Keypair.fromSecretKey(base58.decode(process.env.SOLANA_FT_WALLET));
    // mint出来token的public key
    const mintTokenPub = new PublicKey(process.env.SOLANA_MINT_TOKEN_PUB);
    // 从转出wallet中获取其关联的token账户
    const fromTokenAccount = await getAssociatedTokenAddress(mintTokenPub, fromWallet.publicKey);
    // 转入wallet的publick key
    const toWalletPub = new PublicKey(req.user.wallet_pub);
    // 根据转入wallet创建或获取关联的token账户
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mintTokenPub, toWalletPub);

    // TODO: 链上的实际转账操作与数据库记录需要分开
    // 因为链上的操作是无法回滚的，放在一起的话无法保证链上提交成功和数据库写入同时成功或失败
    // 正确的操作应该是先记录数据库，定时任务去发起提现+查询提现状态
    // 当前代码仅供demo使用，以上TODO非常重要，上线前必须完成修改
    await prisma.$transaction(
      async (tx) => {
        // 转账
        const signature = await transferChecked(
          connection,
          feePayerWallet,
          fromTokenAccount,
          mintTokenPub,
          toTokenAccount.address,
          fromWallet.publicKey,
          amount.times(new Decimal(1e9)).toNumber(),
          9
        );

        // 从账户中扣除提现的余额
        await updateBalanceTX(tx, req.user.mid, amount, "minus", SOURCE_WITHDRAW);

        // 记录提现流水
        await tx.dc_transactions.create({
          data: {
            fee_payer_pub: feePayerWallet.publicKey.toBase58(),
            from_pub: fromWallet.publicKey.toBase58(),
            to_pub: req.user.wallet_pub,
            mint_pub: mintTokenPub.toBase58(),
            signature: signature,
            amount: amount.toNumber(),
            source: TX_TYPE_WITHDRAW,
            tx_type: TX_TYPE_WITHDRAW,
          },
        });
      },
      { maxWait: 5000, timeout: 10000 }
    );

    resp.status(200).json({ msg: "ok" });
  } catch (e) {
    console.trace(e);
    logger.logErrorReq(req, e);
    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default auth(verify(handler, { method: "post", dataSchema }));
