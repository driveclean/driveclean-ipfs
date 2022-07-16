import { COUNT_TYPE_ADD, COUNT_TYPE_MINUS } from "@constants/token";
import { Prisma, PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import prisma from "../../prisma";

/**
 * 更新用户余额
 * @param mid 用户id
 * @param amount 变动金额
 * @param operator 操作符，仅支持 add(增加) 和 minus(减少)
 * @param source 调用方
 * @returns 变动操作的事务Promise
 */
export const updateBalance = (
  mid: string,
  amount: Decimal | number | string,
  operator: "add" | "minus",
  source: number
) => {
  const data = { balance: {} } as any;
  let countType = COUNT_TYPE_ADD;
  if (operator === "add") {
    data.balance.increment = amount;
  } else {
    data.balance.decrement = amount;
    countType = COUNT_TYPE_MINUS;
  }
  const updateUser = prisma.dc_users.update({ where: { id: BigInt(mid) }, data });
  const createBalanceLog = prisma.dc_balance_logs.create({
    data: { mid: BigInt(mid), amount, count_type: countType, source },
  });
  return prisma.$transaction([updateUser, createBalanceLog]);
};

/**
 * 在事务中更新用户余额
 * @param tx 事务
 * @param mid 用户id
 * @param amount 变动金额
 * @param operator 操作符，仅支持 add(增加) 和 minus(减少)
 * @param source 调用方
 * @returns 变动操作的事务Promise
 */
export const updateBalanceTX = async (
  tx: Prisma.TransactionClient,
  mid: string,
  amount: Decimal | number | string,
  operator: "add" | "minus",
  source: number
) => {
  const data = { balance: {} } as any;
  let countType = COUNT_TYPE_ADD;
  if (operator === "add") {
    data.balance.increment = amount;
  } else {
    data.balance.decrement = amount;
    countType = COUNT_TYPE_MINUS;
  }
  const user = await tx.dc_users.update({ where: { id: BigInt(mid) }, data });
  const balanceLog = await tx.dc_balance_logs.create({
    data: { mid: BigInt(mid), amount, count_type: countType, source },
  });
  return [user, balanceLog];
};
