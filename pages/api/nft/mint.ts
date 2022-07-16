import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import { convertRepairAmountToDCT } from "@components/car/car-detail";
import prisma from "@lib/prisma";
import NP from "number-precision";
import { MAX_MINT_TIMES } from "@constants/constants";
import { dc_nft_cars } from "@prisma/client";

export interface MintReq {
  base_id: string;
  selected_id: string;
}

// body的校验规则
const dataSchema = Joi.object<MintReq>({
  base_id: Joi.string().min(1).required(),
  selected_id: Joi.string().min(1).required(),
});

const handler = async (req: ApiRequest<null, MintReq>, resp: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }

    // 检查当前用户是否拥有该nft
    const nftList = await prisma.dc_nft_cars.findMany({
      where: { id: { in: [BigInt(req.data.base_id), BigInt(req.data.selected_id)] }, owner_mid: BigInt(req.user.mid) },
    });
    if (nftList.length !== 2) {
      resp.statusCode = 400;
      throw new Error("you don't have these nft");
    }

    // 检查nft可mint次数
    for (const nft of nftList) {
      if (nft.car_mint_times >= MAX_MINT_TIMES) {
        resp.statusCode = 400;
        throw new Error("nft reached max mint times");
      }
    }

    let newNft: dc_nft_cars;
    await prisma.$transaction(
      async (tx) => {
        // 查找一个可被mint的nft并mint
        newNft = await tx.dc_nft_cars.findFirst({ where: { is_distributed: false, owner_mid: BigInt(0) } });
        if (!newNft) {
          resp.statusCode = 500;
          throw new Error("no nft available");
        }
        newNft = await tx.dc_nft_cars.update({
          where: { id: newNft.id },
          data: { is_distributed: true, owner_mid: BigInt(req.user.mid) },
        });
        // 修改nft的mint次数
        for (const nft of nftList) {
          await tx.dc_nft_cars.update({
            where: { id: BigInt(nft.id) },
            data: { car_mint_times: { increment: 1 } },
          });
        }
      },
      { maxWait: 5000, timeout: 10000 }
    );

    resp.status(200).json(newNft);
  } catch (e) {
    logger.logErrorReq(req, e);
    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: e.message });
    return;
  }
};

export default auth(verify(handler, { dataSchema }));
