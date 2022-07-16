import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import verify from "@lib/api/middlewares/verify";
import prisma from "@lib/prisma";
import { Decimal } from "@prisma/client/runtime";

/**
 * 获取用户余额
 * @param mid 用户id
 * @returns 包装后的数值
 */
export const getBalance = async (mid: string): Promise<Decimal> => {
  const user = await prisma.dc_users.findUnique({
    select: { balance: true },
    where: { id: BigInt(mid) },
  });
  return user.balance;
};

const handler = async (req: ApiRequest<null, null>, resp: NextApiResponse) => {
  try {
    const totalAmount = await getBalance(req.user.mid);

    resp.status(200).json({ balance: totalAmount.toString() });
  } catch (e) {
    logger.errorc(req, e);
    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default auth(verify(handler, { method: "get" }));
