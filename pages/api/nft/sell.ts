import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import { convertRepairAmountToDCT } from "@components/car/car-detail";
import prisma from "@lib/prisma";
import NP from "number-precision";

export interface SellReq {
  id: string;
  selling_price: string;
}

// body的校验规则
const dataSchema = Joi.object<SellReq>({
  id: Joi.string().min(1).required(),
  selling_price: Joi.string().min(1).required(),
});

const handler = async (req: ApiRequest<null, SellReq>, resp: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }

    const nft_id = req.data.id;

    // 检查当前用户是否拥有该nft
    const nft = await prisma.dc_nft_cars.findUnique({ where: { id: BigInt(nft_id) } });
    if (nft.owner_mid.toString() !== req.user.mid) {
      resp.statusCode = 400;
      throw new Error("you don't have this nft");
    }
    // 该nft是否处于可卖状态
    if (nft.is_listed) {
      resp.statusCode = 400;
      throw new Error("this nft is already listed");
    }
    // 检查出售价格是否合法
    if (Number.isNaN(Number(req.data.selling_price))) {
      resp.statusCode = 400;
      throw new Error("invalid selling price");
    }

    // 修改nft价格以及上架状态
    await prisma.dc_nft_cars.update({
      where: { id: BigInt(nft_id) },
      data: { is_listed: true, price: req.data.selling_price },
    });

    resp.status(200).json({ msg: "ok" });
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
