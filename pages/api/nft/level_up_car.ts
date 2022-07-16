import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import prisma from "@lib/prisma";
import { calcLevelUpCost } from "@lib/game-logic";
import { SOURCE_CAR_NFT_LEVELUP } from "@constants/token";
import { updateBalance } from "@lib/api/balance/balance";
import { getBalance } from "../balance/get";

export interface LevelupCarReq {
  id: number;
}

// body的校验规则
const dataSchema = Joi.object<LevelupCarReq>({
  id: Joi.number().integer().min(0).required(),
});

const handler = async (req: ApiRequest<null, LevelupCarReq>, resp: NextApiResponse) => {
  try {
    const nft_id = req.data.id;

    // Prisma atomic number ops: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#atomic-number-operations
    const car = await prisma.dc_nft_cars.findUnique({
      where: { id: nft_id },
    });

    const user_dct_balance = await getBalance(req.user.mid);

    const level_cost_in_dct = calcLevelUpCost(car.level);

    if (user_dct_balance.lessThan(level_cost_in_dct)) {
      resp.status(401).json({ msg: "Error. Not enough DCT" });
      return;
    }

    await updateBalance(req.user.mid, level_cost_in_dct, "minus", SOURCE_CAR_NFT_LEVELUP);

    const newUser = await prisma.dc_nft_cars.update({
      where: { id: nft_id },
      data: { level: { increment: 1 } },
    });
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

export default auth(verify(handler, { dataSchema, method: "post" }));
