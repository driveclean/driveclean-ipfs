import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import redis, { lock, REDIS_KEY_PREFIX_LOCK, unlock } from "@lib/redis";
import { REDIS_KEY_CRON_CHECK_CHARGE_STATUS } from "@constants/redis";
import auth from "@lib/api/middlewares/auth";
import prisma from "@lib/prisma";
import { getRandomString } from "@lib/utils";
import { CHARGE_STATUS_FINISHED } from "@constants/charge";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import { Decimal } from "@prisma/client/runtime";
import { SOURCE_CHARGE_STOP } from "@constants/token";
import { updateBalanceTX } from "@lib/api/balance/balance";

export interface StopChargeReq {
  charge_id: string;
}

// body的校验规则
const dataSchema = Joi.object<StopChargeReq>({
  charge_id: Joi.string().required(),
});

// 添加到检查列表
export const removeFromCheckList = async (mid: string, chargeId: string) => {
  await redis.zrem(REDIS_KEY_CRON_CHECK_CHARGE_STATUS, `${mid}:${chargeId}`);
};

const handler = async (req: ApiRequest<null, StopChargeReq>, resp: NextApiResponse) => {
  const lockKey = `${REDIS_KEY_PREFIX_LOCK}:stop_charge:${req.user.mid}`;
  const lockValue = getRandomString(16);
  try {
    // 防止多次提交，对请求进行上锁
    const isLocked = await lock(lockKey, lockValue, 10);
    if (!isLocked) {
      resp.status(400).json({
        msg: "former request is processing",
      });
      return;
    }

    // 充电结束则计算过程中所有数值写入数据库
    const chargeLogs = await prisma.dc_charges.findUnique({
      select: { dc_charge_logs: true },
      where: { id: BigInt(req.data.charge_id) },
    });
    let totalKwh = new Decimal(0);
    let totalAmount = new Decimal(0);
    chargeLogs.dc_charge_logs.forEach((chargeLog) => {
      chargeLog.kwh;
      totalKwh = totalKwh.add(chargeLog.kwh);
      totalAmount = totalAmount.add(chargeLog.amount);
    });

    await prisma.$transaction(
      async (tx) => {
        // 充电已结束，则计算总充电量和总获得的代币
        await tx.dc_charges.update({
          data: { charge_status: CHARGE_STATUS_FINISHED, total_kwh: totalKwh, total_amount: totalAmount },
          where: { id: BigInt(req.data.charge_id) },
        });
        // 向用户余额中添加代币
        await updateBalanceTX(tx, req.user.mid, totalAmount, "add", SOURCE_CHARGE_STOP);

        // 从检查列表中删除
        await removeFromCheckList(req.user.mid, req.data.charge_id);
      },
      { maxWait: 5000, timeout: 10000 }
    );

    resp.status(200).json({ msg: "ok" });
  } catch (e) {
    let msg = e.message;
    if (resp.statusCode === 200) {
      logger.logErrorReq(req, e);
      resp.statusCode = 500;
      msg = "internal server error";
    }
    resp.json({ msg: msg });
    return;
  } finally {
    await unlock(lockKey, lockValue);
  }
};

export default auth(verify(handler, { method: "post", dataSchema }));
