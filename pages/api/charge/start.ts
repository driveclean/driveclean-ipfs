import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import redis, { lock, REDIS_KEY_PREFIX_LOCK, unlock } from "@lib/redis";
import {
  getChargeStateKey,
  getRemainingKwhKey,
  REDIS_HASH_KEY_TESLA_CHARGING_STATE,
  REDIS_KEY_PREFIX_FAKE_CHARGE_STATE_CHECK_COUNT,
  REDIS_TTL_CHARGE_STATE,
  REDIS_TTL_REMAINING_KWH,
} from "@constants/redis";
import { DateTime } from "luxon";
import auth from "@lib/api/middlewares/auth";
import prisma from "@lib/prisma";
import { callTeslaAPI } from "@lib/tesla";
import { POWER_FACTOR } from "@constants/constants";
import { getRandomInt, getRandomString } from "@lib/utils";
import { dc_charges, PrismaClient } from "@prisma/client";
import { CHARGE_STATUS_CHARGING } from "@constants/charge";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import NP from "number-precision";
import { IS_FAKE_CHARGE } from "@constants/config";
import { CHARGING_STATE_DISCONNECTED } from "@constants/tesla";
import { addToChargeCheckList } from "@lib/api/charge/charge";

/**
 * 充电状态
 * 其中包含了Earning计算因子：e, n, c1, c2, d
 * 公式：DCT = E * N * C1 * C2 * (1 - D) * rand(L1, L2)
 * 另外，E = Electricity usage (in kWh) / 100 * Power，L1和L2为定义随机值范围的系统常量
 */
export interface ChargeState {
  power?: number; // Power
  n?: number; // N is clean energy factor. Default is 1. It will increase if electricity comes from clean generation sources
  c1?: number; // C_1 is Car factor. It depends on a Car's Horsepower attribute
  c2?: number; // C_2 is Car Parts factor. It depends on the types of Car Parts owned by the user
  d?: number; // D is depreciation factor. Default is 0. If a Car has >50% depreciation, D will start to increase until it reaches 0.8
  counting_week?: string; // countingWeek is the counting week of remaining kWh
  vehicle_id?: string; // vehicle_id is the vehicle id
  tesla_charge_energy_added?: number; // tesla_charge_energy_added is the energy added by tesla
  tesla_charging_state?: string; // tesla_charging_state is the charging state of tesla
}

export interface StartChargeReq {
  car_nft_id: string;
}

// body的校验规则
const dataSchema = Joi.object<StartChargeReq>({
  car_nft_id: Joi.string().required(),
});

const handler = async (req: ApiRequest<null, StartChargeReq>, resp: NextApiResponse) => {
  const lockKey = `${REDIS_KEY_PREFIX_LOCK}:start_charge:${req.user.mid}`;
  const lockValue = getRandomString(16);
  try {
    // 防止多次开始充电，对请求进行上锁
    const isLocked = await lock(lockKey, lockValue, 10);
    if (!isLocked) {
      resp.status(400).json({
        msg: "former request is processing",
      });
      return;
    }

    // 从数据库获取用户状态
    const user = await prisma.dc_users.findUnique({
      select: { power: true, tesla_refresh_token: true, vehicle_id: true },
      where: { id: BigInt(req.user.mid) },
      rejectOnNotFound: false,
    });

    // 校验用户状态是否正常
    // 1. 是否有该用户，TODO: 后续可能有用户状态，如注销、封禁等，需要进行校验
    // 2. TODO: 是否已被邀请，邀请码功能完成后此处需要验证邀请码状态
    // 3. TODO: 查询该用户是否拥有car nft，并获取nft属性
    // 4. tesla_refresh_token是否已上传
    // 5. vehicle_id是否已上传
    if (!user) {
      resp.statusCode = 400;
      throw new Error("user not found");
    }
    if (!user.tesla_refresh_token) {
      resp.statusCode = 400;
      throw new Error("tesla_refresh_token not found");
    }
    if (!user.vehicle_id) {
      resp.statusCode = 400;
      throw new Error("vehicle_id not found");
    }

    // 获取实时车辆的充电状态，同时可以校验refresh_token是否有效，若有效将获取access_token至缓存
    const apiResp = await callTeslaAPI({
      mid: req.user.mid,
      method: "get",
      path: `/vehicles/${user.vehicle_id}/data_request/charge_state`,
    });
    if (apiResp.status === 401) {
      resp.statusCode = 401;
      throw new Error("invalid refresh_token");
    }

    // 查询最后一次充电状态
    const lastChargeStatus = await prisma.dc_charges.findFirst({
      select: { charge_status: true },
      where: { mid: BigInt(req.user.mid) },
      orderBy: { id: "desc" },
    });

    // 如果正在充电则不再继续，返回400
    if (lastChargeStatus && lastChargeStatus.charge_status === CHARGE_STATUS_CHARGING) {
      resp.statusCode = 400;
      throw new Error("already in charging");
    }

    // 充电状态rediskey
    const chargeStateKey = getChargeStateKey(req.user.mid);

    let newCharge: dc_charges;
    await prisma.$transaction(
      async (tx: PrismaClient) => {
        const now = DateTime.now();
        logger.info(`[time from server] ${now.toString()}`);

        // 剩余电量计算周
        const countingWeek = `${now.weekYear}${now.weekNumber}`;

        // 构建充电状态
        // TODO: 应当在此处将c1和c2更换为实际nft的属性，因为nft需要进行验证，所以在上方会拉到相关属性
        const chargeState: ChargeState = {
          power: user.power,
          n: 1, // default to 1 now
          c1: 1, // C_1 is Car factor. It depends on a Car's Horsepower attribute
          c2: 1, // C_2 is Car Parts factor. It depends on the types of Car Parts owned by the user
          d: 0, // default to 0 now
          counting_week: countingWeek,
          vehicle_id: user.vehicle_id,
          tesla_charge_energy_added: 0,
          tesla_charging_state: CHARGING_STATE_DISCONNECTED,
        };

        // 新建充电任务
        newCharge = await tx.dc_charges.create({
          data: { mid: BigInt(req.user.mid), vehicle_id: req.user.vehicle_id, factors: JSON.stringify(chargeState) },
        });

        // 如果未设置当周充电量，则设置当周充电量
        await redis.set(
          getRemainingKwhKey(countingWeek, req.user.mid),
          NP.times(user.power, POWER_FACTOR),
          "EX",
          REDIS_TTL_REMAINING_KWH,
          "NX"
        );

        // 存入充电状态
        await redis.hset(chargeStateKey, chargeState);
        await redis.expire(chargeStateKey, REDIS_TTL_CHARGE_STATE);

        // 向充电状态待检查的列表中添加当前用户
        await addToChargeCheckList(req.user.mid, newCharge.id.toString());
      },
      { maxWait: 5000, timeout: 10000 }
    );

    // 判断配置中是否开启fake充电
    if (IS_FAKE_CHARGE) {
      // 设置fake检查次数
      await redis.set(
        `${REDIS_KEY_PREFIX_FAKE_CHARGE_STATE_CHECK_COUNT}${newCharge.id}`,
        getRandomInt(3, 12),
        "EX",
        3600
      );
    } else {
      // TODO: 检查车辆状态是否处于wake_up，如果获取到了充电状态则立刻更新数据
      let chargingState = CHARGING_STATE_DISCONNECTED;
      const apiData = apiResp.data;
      if (apiData.error) {
        logger.warnc(
          req,
          `user: ${req.user.mid}, calling charge state for vehicle: ${user.vehicle_id} has error: ${apiData.error}`
        );
      } else {
        // 设置初始的tesla充电状态
        const response = apiData.response;
        if (response) {
          await redis.hset(chargeStateKey, REDIS_HASH_KEY_TESLA_CHARGING_STATE, response.charing_state);
        } else {
          logger.warnc(
            req,
            `user: ${req.user.mid}, empty response for vehicle: ${user.vehicle_id} has response: ${response}`
          );
        }
      }
    }

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
