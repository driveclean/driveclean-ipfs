import { COUNT_TYPE_ADD, SOURCE_CHARGE_CRON, SOURCE_CHARGE_STOP } from "@constants/token";
import prisma from "@lib/prisma";
import { Decimal } from "@prisma/client/runtime";
import { DateTime, Settings } from "luxon";

Settings.defaultZone = "Asia/Shanghai";

export interface SpaceUserResp {
  power: string;
  token_earned_weekly: string;
  max_token_weekly: string;
}

export const getSpaceUser = async (mid: string): Promise<SpaceUserResp> => {
  const spaceUserResp = { power: "0.00", token_earned_weekly: "0.00", max_token_weekly: "10.00" } as SpaceUserResp;

  const weekStartTime = DateTime.now().startOf("week").toJSDate();
  const weekEndTime = DateTime.now().endOf("week").toJSDate();

  const rawUser = await prisma.dc_users.findUnique({
    select: {
      power: true,
      dc_balance_logs: {
        select: { amount: true },
        where: {
          count_type: COUNT_TYPE_ADD,
          source: { in: [SOURCE_CHARGE_CRON, SOURCE_CHARGE_STOP] },
          ctime: { gte: weekStartTime, lte: weekEndTime },
        },
      },
    },
    where: { id: BigInt(mid) },
  });

  spaceUserResp.power = rawUser?.power.toFixed(2) ?? "0.00";
  spaceUserResp.token_earned_weekly =
    rawUser?.dc_balance_logs
      ?.reduce((acc, cur) => {
        return acc.add(cur.amount);
      }, new Decimal(0))
      .toFixed(2) ?? "0.00";
  spaceUserResp.max_token_weekly = "10.00";
  return spaceUserResp;
};
