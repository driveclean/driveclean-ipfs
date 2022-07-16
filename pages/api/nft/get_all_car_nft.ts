import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import verify from "@lib/api/middlewares/verify";
import prisma from "@lib/prisma";
import { dc_nft_cars } from "@prisma/client";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/**
 * 获取用户拥有的所有nft cars
 * 
 * @returns 用户拥有的NFT Cars列表
 */

export type ResDataForGetAllCarNFT = {
  msg: string;
  data?: dc_nft_cars[];
};

const handler = async (req: ApiRequest<null, null>, resp: NextApiResponse<ResDataForGetAllCarNFT>) => {
  try {
    if (req.method !== "GET") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }

    const car_nfts = await prisma.dc_nft_cars.findMany({
      where: { owner_mid: BigInt(req.user.mid) },
    });

    resp.status(200).json({ msg: "ok", data: car_nfts ? car_nfts : [] });
  } catch (e) {
    logger.logErrorReq(req, e);
    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default auth(verify(handler));
