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
 * 获取某一个Car NFT的详细信息
 * @param id Car NFT id
 * @returns Car NFT的详细信息
 */
export interface GetCarNFTDetailsReq {
  id: number;
}

// body的校验规则
const paramsSchema = Joi.object<GetCarNFTDetailsReq>({
  id: Joi.number().integer().min(0).required(),
});

export type ResDataForGetCarNFTDetails = {
  msg: string;
  data?: dc_nft_cars;
};

const handler = async (
  req: ApiRequest<null, GetCarNFTDetailsReq>,
  resp: NextApiResponse<ResDataForGetCarNFTDetails>
) => {
  try {
    if (req.method !== "GET") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }

    const nft_id = req.query?.id as string;

    const car_nft = nft_id
      ? await prisma.dc_nft_cars.findUnique({
          where: { id: BigInt(nft_id) },
        })
      : null;

    // TODO: 检验用户是否有权限获得nft details
    if (req.user.mid !== car_nft?.owner_mid.toString()) {
      resp.status(405).json({
        msg: "user not allowed",
      });
    }

    resp.status(200).json({ msg: "ok", data: car_nft });
  } catch (e) {
    logger.logErrorReq(req, e);
    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default auth(verify(handler, { paramsSchema }));
