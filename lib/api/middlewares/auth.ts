import { BACKEND_BASE_URL, DC_TOKEN_COOKIE_NAME } from "constants/constants";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { ApiRequest, CronTokenPayload, TokenPayload } from "@model/model";
import logger from "@lib/logger";

/**
 * token鉴权中间件，如果无token则返回401，token无效则返回403，其他异常返回500
 * @param handler 内层handler
 * @returns 洋葱
 */
const auth =
  <T, U>(handler: NextApiHandler) =>
  (req: ApiRequest<T, U>, resp: NextApiResponse) => {
    try {
      if (req.url.includes(`${BACKEND_BASE_URL}/cron`)) {
        const token = req.headers[DC_TOKEN_COOKIE_NAME];
        if (!token) {
          resp.statusCode = 401;
          throw new Error("Unauthorized");
        }
        const jwtPayload = jwt.verify(token as string, process.env.CRON_JWT_SECRET) as CronTokenPayload;
        if (!req.url.includes(`${BACKEND_BASE_URL}/${jwtPayload.type}/${jwtPayload.name}`)) {
          resp.statusCode = 401;
          throw new Error("Unauthorized");
        }
        return handler(req, resp);
      }
      const token = req.cookies[DC_TOKEN_COOKIE_NAME];
      if (!token) {
        resp.statusCode = 401;
        throw new Error("Unauthorized");
      }
      const jwtPayload = jwt.verify(token as string, process.env.JWT_SECRET) as TokenPayload;
      req.user = jwtPayload;
      req.token = token;
      return handler(req, resp);
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        logger.warn(`[auth] bad token: ${e.message}, req: %o`, req);
        resp.statusCode = 403;
      }
      if (resp.statusCode === 200) {
        logger.error(`[auth] error catched: ${e.message}, req: %o`, req);
        resp.statusCode = 500;
      }
      resp.json({ msg: e.message });
      return;
    }
  };
export default auth;
