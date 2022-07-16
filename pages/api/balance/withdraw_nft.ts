import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import { Cluster, clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  transfer,
  transferChecked,
} from "@solana/spl-token";
import { getBalance } from "./get";
import prisma from "@lib/prisma";
import { SOURCE_WITHDRAW, TX_TYPE_WITHDRAW } from "@constants/token";
import { Decimal } from "@prisma/client/runtime";
import { updateBalanceTX } from "@lib/api/balance/balance";

export interface WithdrawNFTReq {
  mint?: string;
}

// body的校验规则
const dataSchema = Joi.object<WithdrawNFTReq>({
  mint: Joi.string().required(),
});

const accessList = [
  "5HtaHov6REtcechoYsY1i4sHHZZLVGT58Uq5YCRs8bhq",
  "72r42aXmKwjwCurdpnzYCgYxXa38Qr5hkiSkem4LR2yU",
  "BsPAtgnzfUsRphejSjxTafKwwSUiozrFRqBXJquJC77z",
  "DEHfPL6cugrEG4UdnpVVZWt38hcuNRAZSCnd1xty4V2Z",
  "9D6fbkSev44hsnwHHGUQjMmojKdUbCPHWFC9fZT3Btco",
  "6v1KGt2Pi3hXLkd1zRngwQQdG6fVFmbXf72yM6kgCaRH",
  "7oF7m3W1sngZtZ15SvHDYqLGxhhGp17nnYeyvbwF1qXD",
];

const handler = async (req: ApiRequest<null, WithdrawNFTReq>, resp: NextApiResponse) => {
  try {
    if (!accessList.includes(req.user.wallet_pub)) {
      resp.statusCode = 403;
      throw new Error("forbidden");
    }
    // 创建一个solana连接
    const connection = new Connection(clusterApiUrl(process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster), "confirmed");
    // 从这个wallet支付gas费用
    const feePayerWallet = Keypair.fromSecretKey(base58.decode(process.env.SOLANA_FEE_PAYER_WALLET));
    // 从这个wallet转出spl token
    const fromWallet = Keypair.fromSecretKey(base58.decode(process.env.SOLANA_NFT_WALLET));
    // mint出来token的public key
    const mintTokenPub = new PublicKey(req.data.mint);
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
    // 转账
    const signature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount,
      toTokenAccount.address,
      fromWallet.publicKey,
      1
    );

    console.log(signature);

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
