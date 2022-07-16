import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import verify from "@lib/api/middlewares/verify";
import prisma from "@lib/prisma";
import { dc_nft_cars } from "@prisma/client";
import Joi from "joi";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/**
 * 获取所有已上架的Car NFT（is_listed = true)
 *
 * @returns 上架的NFT Cars列表
 */

export type ResDataForGetListedNFTCars = {
  msg: string;
  data?: dc_nft_cars[];
};

const handler = async (req: ApiRequest<null, null>, resp: NextApiResponse<ResDataForGetListedNFTCars>) => {
  try {
    if (req.method !== "GET") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }

    // TODO: replace with is_listed
    const car_nfts = await prisma.dc_nft_cars.findMany({
      where: {
        is_listed: true,
      },
    });
    resp.status(200).json({ msg: "ok", data: car_nfts ? car_nfts : [] });
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

export default auth(verify(handler));
