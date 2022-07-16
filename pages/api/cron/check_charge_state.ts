import { NextApiResponse } from "next";
import { DateTime } from "luxon";
import redis from "@lib/redis";
import logger from "@lib/logger";
import { ApiRequest } from "@model/model";
import {
  getChargeStateKey,
  getRemainingKwhKey,
  REDIS_HASH_KEY_TESLA_CHARGING_STATE,
  REDIS_HASH_KEY_TESLA_CHARG_ENERGY_ADDED,
  REDIS_KEY_CRON_CHECK_CHARGE_STATUS,
  REDIS_KEY_PREFIX_FAKE_CHARGE_STATE_CHECK_COUNT,
} from "@constants/redis";
import auth from "@lib/api/middlewares/auth";
import { CHARGE_STATE_CHECK_INTERVAL, EARNING_FACTOR_L1, EARNING_FACTOR_L2, POWER_FACTOR } from "@constants/constants";
import prisma from "@lib/prisma";
import { callTeslaAPI } from "@lib/tesla";
import axios from "axios";
import { getRandomFloat } from "@lib/utils";
import { CHARGE_STATUS_FINISHED } from "@constants/charge";
import { CHARGING_STATE_CHARGING, CHARGING_STATE_DISCONNECTED, CHARGING_STATE_READY_TO_CHARGE } from "@constants/tesla";
import { Decimal } from "@prisma/client/runtime";
DateTime.local().setZone("Asia/Shanghai"); // 设置本地时区
import NP from "number-precision";
import { updateBalanceTX } from "@lib/api/balance/balance";
import { SOURCE_CHARGE_CRON } from "@constants/token";
import { IS_FAKE_CHARGE } from "@constants/config";
import _ from "lodash";
import { addToChargeCheckList, getChargeState } from "@lib/api/charge/charge";
import pinataSDK from "@pinata/sdk";

const handler = async (req: ApiRequest<null, null>, resp: NextApiResponse) => {
  // 获取当前时间的timestamp
  const startTime = DateTime.now();

  logger.infoc(req, `cron start at: ${startTime.toSeconds()}`);
  try {
    if (req.method !== "POST") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }
    const now = Math.floor(startTime.toSeconds());
    // 获取检查使用的时间范围
    // TODO: `now` should be changed to `now - CHARGE_STATE_CHECK_INTERVAL`
    const checkTimeRange = now;
    // const checkTimeRange = now;
    // 从redis中获取CHARGE_STATE_CHECK_INTERVAL前的所有用户
    const redisResp = await redis.zrangebyscore(REDIS_KEY_CRON_CHECK_CHARGE_STATUS, 0, checkTimeRange);

    // 初始化pinata sdk
    const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

    let isRedisError = false;
    for (const midAndChargeId of redisResp) {
      const [mid, chargeId] = midAndChargeId.split(":");
      if (!mid || !chargeId) {
        logger.errorc(req, `mid or chargeId is null: ${midAndChargeId}`);
        continue;
      }

      const chargeState = await getChargeState(mid); // 获取充电状态
      let chargeEnergyAdded = 0; // 实时充电量
      try {
        // 调用Tesla获取实时充电状态
        const apiResp = await callTeslaAPI({
          mid: mid,
          method: "get",
          path: `/vehicles/${chargeState.vehicle_id}/data_request/charge_state`,
        });

        const chargeStateKey = getChargeStateKey(mid); // 充电状态key
        let kWhIncrement = 0; // 充电增量
        let isFinished = false; // 充电是否结束
        // 判断是否使用fake数据
        if (IS_FAKE_CHARGE) {
          // 随机生成充电2-7kWh的充电数据
          kWhIncrement = getRandomFloat(2, 7);
          // 减去一次fake充电状态检查次数
          const newFakeCheckCount = await redis.decr(`${REDIS_KEY_PREFIX_FAKE_CHARGE_STATE_CHECK_COUNT}${chargeId}`);
          if (newFakeCheckCount <= 0) {
            isFinished = true;
          }
        } else {
          // 是否跳过检查
          let isSkippingCheck = false;
          // 获取充电量和是否结束
          let apiData = apiResp.data;
          const response = apiData.response;
          if (apiData.error || !response) {
            isSkippingCheck = true;
          }
          // 如果充电状态一直是断开，则跳过本次查询
          if (
            response &&
            response.charging_state === CHARGING_STATE_DISCONNECTED &&
            chargeState.tesla_charging_state === CHARGING_STATE_DISCONNECTED
          ) {
            isSkippingCheck = true;
          }

          if (isSkippingCheck) {
            logger.warnc(
              req,
              `check skipped for user: ${mid}, vehicle: ${chargeState.vehicle_id} has response: ${JSON.stringify(
                response
              )}, and tesla_charging_state in cache: ${chargeState.tesla_charging_state}`
            );
            await addToChargeCheckList(mid, chargeId);
            continue;
          }
          // 记录最新充电状态
          await redis.hset(chargeStateKey, REDIS_HASH_KEY_TESLA_CHARGING_STATE, response.charging_state);
          chargeEnergyAdded = response.charge_energy_added ?? 0.0;
          kWhIncrement = NP.minus(chargeEnergyAdded * 1.0, chargeState.tesla_charge_energy_added * 1.0);
          isFinished =
            response.charging_state !== CHARGING_STATE_READY_TO_CHARGE &&
            response.charging_state !== CHARGING_STATE_CHARGING;
        }

        const remainingKwh = await redis.get(getRemainingKwhKey(chargeState.counting_week, mid)); // 获取当周剩余充电量
        let newRemainingKwh = NP.minus(remainingKwh, kWhIncrement);

        if (newRemainingKwh < 0) {
          newRemainingKwh = 0;
          kWhIncrement = newRemainingKwh;
        }

        // 计算获得的token数量
        const e = NP.times(NP.divide(kWhIncrement, POWER_FACTOR), chargeState.power);
        const amount = NP.times(
          e,
          chargeState.n,
          chargeState.c1,
          chargeState.c2,
          NP.minus(1, chargeState.d),
          getRandomFloat(EARNING_FACTOR_L1, EARNING_FACTOR_L2)
        );

        await prisma.$transaction(
          async (tx) => {
            const chargeLog = { charge_id: BigInt(chargeId), kwh: kWhIncrement, amount: amount } as any;
            const pinataResp = await pinata.pinJSONToIPFS(chargeLog);
            chargeLog.cid = pinataResp.IpfsHash;
            // 将充电数据写入数据库
            await tx.dc_charge_logs.create({ data: chargeLog });
            // 设置剩余电量
            await redis.set(getRemainingKwhKey(chargeState.counting_week, mid), newRemainingKwh, "KEEPTTL");
            // 记录当前充电量
            if (chargeEnergyAdded > 0) {
              await redis.hset(chargeStateKey, REDIS_HASH_KEY_TESLA_CHARG_ENERGY_ADDED, chargeEnergyAdded);
            }
          },
          { maxWait: 5000, timeout: 10000 }
        );

        if (isFinished) {
          // 充电结束则计算过程中所有数值写入数据库
          const chargeLogs = await prisma.dc_charges.findUnique({
            select: { dc_charge_logs: true },
            where: { id: BigInt(chargeId) },
          });
          let totalKwh = new Decimal(0);
          let totalAmount = new Decimal(0);
          chargeLogs.dc_charge_logs.forEach((chargeLog) => {
            chargeLog.kwh;
            totalKwh = totalKwh.add(chargeLog.kwh);
            totalAmount = totalAmount.add(chargeLog.amount);
          });

          await prisma.$transaction(async (tx) => {
            // 如果充电已结束，则计算总充电量和总获得的代币
            await tx.dc_charges.update({
              data: { charge_status: CHARGE_STATUS_FINISHED, total_kwh: totalKwh, total_amount: totalAmount },
              where: { id: BigInt(chargeId) },
            });
            // 向用户余额中添加代币
            await updateBalanceTX(tx, mid, totalAmount, "add", SOURCE_CHARGE_CRON);
          });
        } else {
          // 向充电状态待检查的列表中添加当前用户
          await addToChargeCheckList(mid, chargeId);
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          // 如果出现了意料之外的网络请求异常，则把他加回队列
          await addToChargeCheckList(mid, chargeId);
          logger.error(
            `[/api/cron/check_charge_state] user: ${mid}, calling charge state for vehicle: ${chargeState.vehicle_id} has unexpected error: ${e}`
          );
        } else {
          logger.error(`[/api/cron/check_charge_state] user: ${mid} check charge state failed: ${e.message}`);
          // 当redis异常时应立即退出
          isRedisError = true;
          break;
        }
      }
    }
    // 使用some当发生redis错误时立即退出
    if (isRedisError) {
      resp.status(500).json({ msg: "unexpected error" });
      return;
    }

    // 清理本次检查的用户
    await redis.zremrangebyscore(REDIS_KEY_CRON_CHECK_CHARGE_STATUS, 0, checkTimeRange);

    resp.status(200).json({ msg: "ok" });
  } catch (e) {
    logger.logErrorReq(req, e);
    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  } finally {
    const endTime = DateTime.now();
    logger.infoc(req, `cron finished at: ${endTime.toSeconds()}, cost: ${endTime.diff(startTime).toMillis()}ms`);
  }
};

export default auth(handler);
