import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import prisma from "@lib/prisma";
import { convertRepairAmountToDCT } from "@components/car/car-detail";

export interface RepairCarReq {
  id: number;
  repair_amount: number;
}

// body的校验规则
const dataSchema = Joi.object<RepairCarReq>({
  id: Joi.number().integer().min(0).required(),
  repair_amount: Joi.number().integer().min(0).max(100).required(),
});

const handler = async (req: ApiRequest<null, RepairCarReq>, resp: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }

    const nft_id = req.data.id;
    const repair_amount = req.data.repair_amount;
    const dct_required = convertRepairAmountToDCT(repair_amount);

    // TODO: check if user has enough DCT
    // TODO: deduct DCT from user

    const newItem = await prisma.dc_nft_cars.update({
      where: { id: nft_id },
      data: { depreciation: { increment: repair_amount } },
    });

    console.log(newItem);

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

export default auth(verify(handler, { dataSchema }));
