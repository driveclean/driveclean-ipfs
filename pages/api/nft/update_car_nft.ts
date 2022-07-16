import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import prisma from "@lib/prisma";

export interface UpdateCarReq {
  id: number;
  mint_address?: string;
  token_account_address?: string;
  photo_url?: string;
  is_distributed?: boolean;
  owner_mid?: number;
  price?: number;
  royalties?: number;
  level?: number;
  attribute_horsepower?: number;
  attribute_durability?: number;
  attribute_luckiness?: number;
  type?: number;
  rarity?: number;
  lifespan?: number;
  car_mint_times?: number;
  car_parts_1_type?: number;
  car_parts_1_address?: string;
  car_parts_1_rarity?: number;
  car_parts_2_type?: number;
  car_parts_2_address?: string;
  car_parts_2_rarity?: number;
  car_parts_3_type?: number;
  car_parts_3_address?: string;
  car_parts_3_rarity?: number;
  car_parts_4_type?: number;
  car_parts_4_address?: string;
  car_parts_4_rarity?: number;
  depreciation?: number;
}

// body的校验规则
const dataSchema = Joi.object<UpdateCarReq>({
  id: Joi.number().integer().min(0).required(),
  mint_address: Joi.string().min(1),
  token_account_address: Joi.string().min(1),
  photo_url: Joi.string().min(1),
  is_distributed: Joi.boolean(),
  owner_mid: Joi.number().integer().min(0),
  price: Joi.number().integer().min(0),
  royalties: Joi.number().integer().min(0),
  level: Joi.number().integer().min(0),
  attribute_horsepower: Joi.number().integer().min(0),
  attribute_durability: Joi.number().integer().min(0),
  attribute_luckiness: Joi.number().integer().min(0),
  type: Joi.number().integer().min(0),
  rarity: Joi.number().integer().min(0),
  lifespan: Joi.number().integer().min(0),
  car_mint_times: Joi.number().integer().min(0),
  car_parts_1_type: Joi.number().integer().min(0),
  car_parts_1_address: Joi.string().min(1),
  car_parts_1_rarity: Joi.number().integer().min(0),
  car_parts_2_type: Joi.number().integer().min(0),
  car_parts_2_address: Joi.string().min(1),
  car_parts_2_rarity: Joi.number().integer().min(0),
  car_parts_3_type: Joi.number().integer().min(0),
  car_parts_3_address: Joi.string().min(1),
  car_parts_3_rarity: Joi.number().integer().min(0),
  car_parts_4_type: Joi.number().integer().min(0),
  car_parts_4_address: Joi.string().min(1),
  car_parts_4_rarity: Joi.number().integer().min(0),
  depreciation: Joi.number().integer().min(0),
});

// TODO
// -- 1: verify if user has permission to edit the car
// -- 2: add specific options e.g. “level up” / “reduce depreciation”

const handler = async (req: ApiRequest<null, UpdateCarReq>, resp: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }

    const nft_id = req.data.id;

    // 如果字段非空则赋值
    const newFields = {} as UpdateCarReq;
    Object.keys(req.data).forEach((key) => {
      if (key !== "id" && req.data[key]) {
        newFields[key] = req.data[key];
      }
    });

    const newUser = await prisma.dc_nft_cars.update({ data: newFields, where: { id: nft_id } });

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
