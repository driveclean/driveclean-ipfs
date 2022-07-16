import logger from "@lib/logger";
import { ApiRequest } from "@model/model";
import {
  BACKEND_BASE_URL,
  DC_NONCE_HEADER_NAME,
  DC_SIGN_HEADER_NAME,
  DC_TIMESTAMP_HEADER_NAME,
} from "constants/constants";
import { createHash, createHmac } from "crypto";
import Joi, { Schema } from "joi";
import _ from "lodash";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * 对请求进行签名
 * @param method 请求方法 "get" | "post"
 * @param url 请求url，不包含baseUrl
 * @param params query参数
 * @param data body参数
 * @returns 签名
 */
export const sign = (
  timestamp: string,
  nonce: string,
  method: "get" | "post" | string,
  url: string,
  params?: {},
  data?: {}
): string => {
  const signParamList = [timestamp, nonce, method.toUpperCase(), `${BACKEND_BASE_URL}${url}`];

  if (params && !_.isEmpty(params)) {
    const searchParams = new URLSearchParams(params);
    searchParams.sort();
    signParamList.push(searchParams.toString());
  }
  if (data) {
    const signData = createHash("sha1").update(JSON.stringify(data)).digest("hex");
    signParamList.push(signData);
  }
  const sign = createHmac("sha1", process.env.NEXT_PUBLIC_BACKEND_CALL_SIGN_SECREY_KEY)
    .update(signParamList.join("\n"))
    .digest("hex");
  return sign;
};

/**
 * 校验请求参数中间件，验签失败和参数错误均返回400，未知异常返回500
 * @param handler 内层handler
 * @param schemas 其中，paramsSchema为url参数的校验规则，dataSchema为body参数的校验规则
 * @returns 洋葱
 */
const verify =
  <T, U>(
    handler: NextApiHandler,
    {
      method,
      paramsSchema,
      dataSchema,
    }: { method?: string; paramsSchema?: Joi.Schema<T>; dataSchema?: Joi.Schema<U> } = {}
  ) =>
  <T, U>(req: ApiRequest<T, U>, resp: NextApiResponse) => {
    try {
      if (method && req.method.toLowerCase() !== method.toLowerCase()) {
        resp.statusCode = 405;
        throw new Error("method not allowed");
      }
      const inputTimestamp = req.headers[DC_TIMESTAMP_HEADER_NAME];
      const inputNonce = req.headers[DC_NONCE_HEADER_NAME];
      const inputSign = req.headers[DC_SIGN_HEADER_NAME];
      if (!inputTimestamp || !inputNonce || !inputSign) {
        resp.statusCode = 400;
        throw new Error("Bad Request");
      }
      const reSign = sign(
        inputTimestamp as string,
        inputNonce as string,
        req.method,
        req.url.split("?")[0].replace(BACKEND_BASE_URL, ""),
        req.query,
        req.body
      );
      if (inputSign !== reSign) {
        resp.statusCode = 400;
        throw new Error("Bad Request");
      }
      // 如果有入参schema，则进行校验
      if (paramsSchema) {
        const cr = paramsSchema.validate(req.query);
        if (cr.error) {
          resp.statusCode = 400;
          throw cr.error;
        }
        req.params = cr.value;
      }
      if (dataSchema) {
        const cr = dataSchema.validate(req.body);
        if (cr.error) {
          resp.statusCode = 400;
          throw cr.error;
        }
        req.data = cr.value;
      }
      return handler(req, resp);
    } catch (e) {
      if (resp.statusCode === 200) {
        logger.error(`[verify] error catched: ${e.message}, req: %o`, req);
        resp.statusCode = 500;
      } else {
        logger.warn(`[verify] bad params: ${e.message}, req: %o`, req);
      }
      resp.json({ msg: e.message });
      return;
    }
  };
export default verify;
