import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import prisma from "@lib/prisma";
import useDC from "@lib/dc/dc";
import { ResDataForGetAllCarNFT } from "./get_all_car_nft";

/**
 * 购买某一个Car NFT
 * @param id Car NFT id
 * @returns 购买是否成功
 */

export interface PurchaseNFTCarReq {
  id: number;
}

// body的校验规则
const dataSchema = Joi.object<PurchaseNFTCarReq>({
  id: Joi.number().integer().min(0).required(),
});

const ALLOWED_METHOD = "POST";

export type ResDataForPurchaseNFTCar = {
  msg: string;
};

const handler = async (req: ApiRequest<null, PurchaseNFTCarReq>, resp: NextApiResponse) => {
  try {
    const nft_id = req.data.id;

    // TO DELETE: 目前只能买一个
    const current_cars = await prisma.dc_nft_cars.findMany({
      where: { owner_mid: BigInt(req.user.mid) },
    });
    
    if (current_cars?.length > 0) {
      resp.status(400).json({ msg: "Error. Can only own 1 NFT at the moment." });
      return;
    }

    // 检查id是否存在，是否已上架
    const car = await prisma.dc_nft_cars.findUnique({
      where: { id: nft_id },
    });

    if (!car) {
      resp.status(400).json({ msg: "Error. Item does not exist." });
    } else if (!car.is_listed) {
      resp.status(400).json({ msg: "Error. Item is not listed." });
    } else {
      const updateCar = await prisma.dc_nft_cars.update({
        where: { id: nft_id },
        data: {
          is_listed: false,
          owner_mid: BigInt(req.user.mid),
        },
      });

      // TODO: 扣除对应金额

      resp.status(200).json({ msg: "ok" });
    }
  } catch (e) {
    logger.logErrorReq(req, e);
    console.log(e);
    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default auth(verify(handler, { dataSchema, method: ALLOWED_METHOD }));
