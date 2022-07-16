import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import Joi from "joi";
import verify from "@lib/api/middlewares/verify";
import { callTeslaAPI, TeslaAPIError } from "@lib/tesla";

export interface CallTeslaReq {
  method?: string;
  path?: string;
  data?: any;
}

// body的校验规则
const dataSchema = Joi.object<CallTeslaReq>({
  method: Joi.string().valid("get", "GET", "post", "POST").required(),
  path: Joi.string().required(),
  data: Joi.any(),
});

const handler = async (req: ApiRequest<null, CallTeslaReq>, resp: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      resp.status(405).json({
        msg: "method not allowed",
      });
      return;
    }

    // 获取特斯拉token登录地区
    const teslaAPIResp = await callTeslaAPI({
      mid: req.user.mid,
      method: req.data.method,
      path: req.data.path,
      refreshToken: req.data.data.tesla_refresh_token,
    });

    resp.status(teslaAPIResp.status).json(teslaAPIResp.data);
  } catch (e) {
    if (e instanceof TeslaAPIError) {
      resp.statusCode = e.status;
      resp.json({ msg: e.message });
      return;
    }
    logger.logErrorReq(req, e);
    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default auth(verify(handler, { dataSchema }));
