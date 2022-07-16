import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@lib/prisma";
import verify from "@lib/api/middlewares/verify";
import Joi from "joi";
import { DateTime } from "luxon";
import jwt from "jsonwebtoken";
import { CookieSerializeOptions, serialize } from "cookie";
import { DC_TOKEN_COOKIE_NAME } from "constants/constants";
import { dc_users } from "@prisma/client";
import { ApiRequest, TokenPayload } from "@model/model";
import base58 from "bs58";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import logger from "@lib/logger";

const JWT_TOKEN_EXPIRES_IN = parseInt(process.env.JWT_TOKEN_EXPIRES_IN);

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export interface SignInReq {
  wallet_pub: string; // 钱包公钥
  wallet_token?: string; // 钱包token，app访问时获取
  message: string; // 签名信息
  signature: string; // 签名
}

// body的校验规则
const dataSchema = Joi.object<SignInReq>({
  wallet_pub: Joi.string().required(),
  wallet_token: Joi.string(),
  message: Joi.string().required(),
  signature: Joi.string().required(),
});

/**
 * 设置token cookie
 * @param resp 接口响应体
 * @param user 用户信息
 */
export const setTokenCookie = (resp: NextApiResponse, user: dc_users) => {
  const jwtPayload = {
    mid: user.id.toString(),
    wallet_pub: user.wallet_pub,
    wallet_token: user.wallet_token,
    wallet_type: user.wallet_type,
    email: user.email,
    is_email_verified: user.is_email_verified,
    uname: user.uname,
    face: user.face,
    sex: user.sex,
    last_login_time: DateTime.fromJSDate(user.last_login_time).toFormat("yyyy-MM-dd HH:mm:ss"),
    is_set_tesla_refresh_token: user.tesla_refresh_token ? true : false,
    vehicle_id: user.vehicle_id,
  } as TokenPayload;
  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: `${process.env.JWT_TOKEN_EXPIRES_IN}h` });
  const cookieOptions = {
    path: "/",
    maxAge: JWT_TOKEN_EXPIRES_IN * 60 * 60,
    expires: new Date(new Date().getTime() + JWT_TOKEN_EXPIRES_IN * 60 * 60 * 1000),
  } as CookieSerializeOptions;
  resp.setHeader("Set-Cookie", serialize(DC_TOKEN_COOKIE_NAME, token, cookieOptions));
};

/**
 * 登录接口
 * @param req 需传递用户钱包公钥、前端生成的消息和对用户用钱包对消息的签名
 * @param resp 接口响应体
 * @returns 成功则返回ok，失败则返回封装后的错误
 */
const handler = async (req: ApiRequest<null, SignInReq>, resp: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }
    if (
      !nacl.sign.detached.verify(
        new TextEncoder().encode(req.data.message),
        base58.decode(req.data.signature),
        new PublicKey(base58.decode(req.data.wallet_pub)).toBytes()
      )
    ) {
      resp.statusCode = 400;
      throw new Error("invalid signature");
    }

    const user = await prisma.$transaction(
      async (tx) => {
        const user = await tx.dc_users.findUnique({
          where: { wallet_pub: req.data.wallet_pub },
          rejectOnNotFound: false,
        });
        if (!user) {
          return tx.dc_users.create({
            data: {
              wallet_pub: req.data.wallet_pub,
              wallet_token: req.data?.wallet_token, // 如果通过app登录，会获得wallet_token，该token不会过期，可以存入数据库
              wallet_type: "Phantom", // 当前仅支持Phantom钱包
              uname: "Racer",
              last_login_time: DateTime.local().toJSDate(),
            },
          });
        } else {
          const newUser = {
            last_login_time: DateTime.local().toJSDate(),
          } as any;
          // 如果首次为pc登录，当通过app登录时，会获得wallet_token，需要存入数据库
          if (!user.wallet_token && req.data.wallet_token) {
            newUser.wallet_token = req.data.wallet_token;
          }
          return tx.dc_users.update({
            data: newUser,
            where: { id: user.id },
          });
        }
      },
      { maxWait: 5000, timeout: 10000 }
    );
    setTokenCookie(resp, user); // 设置token cookie
    resp.status(200).json({ msg: "ok" });
  } catch (e) {
    logger.logErrorReq(req, e);
    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default verify(handler, { dataSchema });
