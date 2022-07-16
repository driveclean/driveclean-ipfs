import { getChargeStateKey, getRemainingKwhKey, REDIS_KEY_CRON_CHECK_CHARGE_STATUS } from "@constants/redis";
import redis from "@lib/redis";
import _ from "lodash";
import { DateTime } from "luxon";
import { ChargeState } from "pages/api/charge/start";
import NP from "number-precision";
import prisma from "@lib/prisma";
import { Decimal } from "@prisma/client/runtime";
import { CHARGE_STATUS_CHARGING } from "@constants/charge";
import { CHARGING_STATE_CHARGING, CHARGING_STATE_COMPLETE } from "@constants/tesla";
import { dc_charge_logs } from "@prisma/client";

// 添加到检查列表
export const addToChargeCheckList = async (mid: string, chargeId: string) => {
  await redis.zadd(REDIS_KEY_CRON_CHECK_CHARGE_STATUS, Math.floor(DateTime.now().toSeconds()), `${mid}:${chargeId}`);
};

// 获取充电状态
export const getChargeState = async (mid: string) => {
  const chargeStateKey = getChargeStateKey(mid);
  const rawChargeState = await redis.hgetall(chargeStateKey);
  if (_.isEmpty(rawChargeState)) {
    return;
  }
  return {
    power: NP.times(rawChargeState.power, 1.0),
    n: NP.times(rawChargeState.n, 1.0),
    c1: NP.times(rawChargeState.c1, 1.0),
    c2: NP.times(rawChargeState.c2, 1.0),
    d: NP.times(rawChargeState.d, 1.0),
    counting_week: rawChargeState.counting_week,
    vehicle_id: rawChargeState.vehicle_id,
    tesla_charge_energy_added: NP.times(rawChargeState.tesla_charge_energy_added, 1.0),
    tesla_charging_state: rawChargeState.tesla_charging_state,
  } as ChargeState;
};

export interface ChargeGetResp {
  charge_id?: string;
  charge_state?: string;
  max_kwh?: string;
  remaining_kwh?: string;
  total_kwh?: string;
  total_amount?: string;
  last_kwh?: string;
  last_amount?: string;
}

// 获取最新一次的充电信息
export const chargeGet = async (mid: string, chargeId?: string): Promise<ChargeGetResp> => {
  const where = { mid: BigInt(mid) } as any;
  if (chargeId) {
    where.id = BigInt(chargeId);
  }

  // 查找最后一条充电记录和所有充电流水
  const charge = await prisma.dc_charges.findFirst({
    select: { id: true, charge_status: true, dc_charge_logs: true },
    where: where,
    orderBy: { mtime: "desc" },
  });

  let chargeGetResp = {
    charge_id: "0",
    charge_status: 1,
    max_kwh: "0",
    remaining_kwh: "0",
    total_kwh: "0",
    total_amount: "0",
    last_kwh: "0",
    last_amount: "0",
  } as ChargeGetResp;
  if (charge) {
    let totalKwh = new Decimal(0);
    let totalAmount = new Decimal(0);
    charge.dc_charge_logs.forEach((chargeLog) => {
      totalKwh = totalKwh.add(chargeLog.kwh);
      totalAmount = totalAmount.add(chargeLog.amount);
    });

    // 取最后一个充电记录
    let lastChargeLog: dc_charge_logs;
    if (charge.dc_charge_logs.length > 0) {
      charge.dc_charge_logs.sort((a, b) => {
        if (a.mtime.getTime() > b.mtime.getTime()) return -1;
        if (a.mtime.getTime() < b.mtime.getTime()) return 1;
        return 0;
      });
      lastChargeLog = charge.dc_charge_logs[0];
    }

    chargeGetResp = {
      charge_id: charge.id.toString(),
      charge_state: charge.charge_status === CHARGE_STATUS_CHARGING ? CHARGING_STATE_CHARGING : CHARGING_STATE_COMPLETE,
      total_kwh: totalKwh.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      last_kwh: lastChargeLog ? lastChargeLog.kwh.toFixed(2) : "0",
      last_amount: lastChargeLog ? lastChargeLog.amount.toFixed(2) : "0",
    };

    // 获取当周剩余充电量
    const chargeState = await getChargeState(mid);
    if (chargeState) {
      chargeGetResp.max_kwh = NP.times(chargeState.power, 100).toFixed(2);
      chargeGetResp.remaining_kwh = await redis.get(getRemainingKwhKey(chargeState.counting_week, mid));
    }
  }
  return chargeGetResp;
};
