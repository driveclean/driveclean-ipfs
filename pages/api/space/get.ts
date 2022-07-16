import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import auth from "@lib/api/middlewares/auth";
import verify from "@lib/api/middlewares/verify";
import logger from "@lib/logger";
import { chargeGet, ChargeGetResp } from "@lib/api/charge/charge";
import prisma from "@lib/prisma";
import { dc_nft_cars } from "@prisma/client";
import { getSpaceUser, SpaceUserResp } from "@lib/api/user/user";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export interface SpaceGetResp {
  car_nft_list: Array<dc_nft_cars>;
  charge: ChargeGetResp;
  user: SpaceUserResp;
}

const handler = async (req: ApiRequest<null, null>, resp: NextApiResponse) => {
  try {
    const chargeGetRespPromise = chargeGet(req.user.mid);
    const nftGetAllCarNFTRespPromise = prisma.dc_nft_cars.findMany({
      where: { owner_mid: BigInt(req.user.mid) },
    });
    const spaceUserRespPromise = getSpaceUser(req.user.mid);
    const rawRespList = await Promise.all([chargeGetRespPromise, nftGetAllCarNFTRespPromise, spaceUserRespPromise]);
    const chargeGetResp = rawRespList[0];
    const nftGetAllCarNFTResp = rawRespList[1];
    const spaceUserResp = rawRespList[2];
    const spaceGetResp = {
      car_nft_list: nftGetAllCarNFTResp ?? [],
      charge: chargeGetResp,
      user: spaceUserResp,
    } as SpaceGetResp;
    resp.status(200).json(spaceGetResp);
  } catch (e) {
    if (resp.statusCode === 200) {
      logger.errorc(req, `mid: ${req.user.mid}, has unexpected error: ${e.stack}`);
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default auth(verify(handler, { method: "get" }));
