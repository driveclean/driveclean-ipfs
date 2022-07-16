import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import redis from "@lib/redis";
import { REDIS_KEY_CRON_CHECK_CHARGE_STATUS } from "@constants/redis";
import { DateTime } from "luxon";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import prisma from "@lib/prisma";
import { setTokenCookie } from "./sign_in";

export interface UpdateUserReq {
  uname?: string;
  tesla_refresh_token?: string;
  vehicle_id?: string;
}

// body的校验规则
const dataSchema = Joi.object<UpdateUserReq>({
  uname: Joi.string().min(1),
  tesla_refresh_token: Joi.string().min(1),
  vehicle_id: Joi.string().min(1),
});

const handler = async (req: ApiRequest<null, UpdateUserReq>, resp: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }

    // 如果字段非空则赋值
    const newFields = {} as UpdateUserReq;
    Object.keys(req.data).forEach((key) => {
      if (req.data[key]) {
        newFields[key] = req.data[key];
      }
    });

    const newUser = await prisma.dc_users.update({ data: newFields, where: { id: BigInt(req.user.mid) } });
    // 更新用户后，需要重新设置cookie
    setTokenCookie(resp, newUser);

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

export default auth(verify(handler, { dataSchema }));
