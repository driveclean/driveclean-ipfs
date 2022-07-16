import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import auth from "@lib/api/middlewares/auth";
import verify from "@lib/api/middlewares/verify";
import logger from "@lib/logger";
import Joi from "joi";
import { chargeGet } from "@lib/api/charge/charge";
export interface ChargeGetReq {
  charge_id: string;
}

const paramsSchema = Joi.object({
  charge_id: Joi.string(),
});

const handler = async (req: ApiRequest<ChargeGetReq, null>, resp: NextApiResponse) => {
  try {
    const chargeGetResp = await chargeGet(req.user.mid, req.params.charge_id);
    resp.status(200).json(chargeGetResp);
  } catch (e) {
    if (resp.statusCode === 200) {
      logger.errorc(req, `mid: ${req.user.mid}, has unexpected error: ${e.stack}`);
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default auth(verify(handler, { method: "get", paramsSchema }));
