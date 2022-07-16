import {
  TESLA_API_BASE_URL,
  TESLA_API_BASE_URL_CN,
  TESLA_TOKEN_CLIENT_ID,
  TESLA_TOKEN_GRANT_TYPE,
  TESLA_TOKEN_SCOPE,
  TESLA_TOKEN_URL,
  TESLA_TOKEN_URL_CN,
} from "@constants/tesla";
import axios from "axios";
import redis from "@lib/redis";
import { REDIS_KEY_PREFIX_TESLA_ACCESS_TOKEN } from "@constants/redis";
import url from "url";
import jwt from "jsonwebtoken";
import prisma from "./prisma";

// 从缓存中获取特斯拉的access_token，如果没有，则通过refresh_token获取并存入缓存
export const getTeslaAccessToken = async (mid: string, refreshToken?: string) => {
  const redisKey = REDIS_KEY_PREFIX_TESLA_ACCESS_TOKEN + mid;
  let accessToken = await redis.get(redisKey);
  let region: string;
  if (!accessToken) {
    if (!refreshToken) {
      const user = await prisma.dc_users.findUnique({
        select: { tesla_refresh_token: true },
        where: { id: BigInt(mid) },
      });
      refreshToken = user.tesla_refresh_token;
    }
    if (!refreshToken) {
      throw new Error("refresh_token not found");
    }
    const region = getRegionFromToken(refreshToken);
    const params = new url.URLSearchParams({
      grant_type: TESLA_TOKEN_GRANT_TYPE,
      client_id: TESLA_TOKEN_CLIENT_ID,
      scope: TESLA_TOKEN_SCOPE,
      refresh_token: refreshToken,
    });
    const resp = await axios(region === "com" ? TESLA_TOKEN_URL : TESLA_TOKEN_URL_CN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: params.toString(),
    });
    accessToken = resp.data.access_token;
    await redis.set(redisKey, accessToken, "EX", resp.data.expires_in);
  }
  if (!region) {
    region = getRegionFromToken(accessToken);
  }
  return { accessToken, region };
};

// 拼接特斯拉的请求url
export const buildTeslaAPIUrl = (region: string, path: string, query?: { [key: string]: string }) => {
  const queryString = new URLSearchParams(query).toString();
  return `${region === "com" ? TESLA_API_BASE_URL : TESLA_API_BASE_URL_CN}${path}${
    queryString ? "?" : ""
  }${queryString}`;
};

// 调用特斯拉API的参数
interface CallTeslaAPIProps {
  mid: string;
  method: string;
  path: string;
  query?: { [key: string]: string };
  refreshToken?: string;
}

// 判断token来自哪个地区
const getRegionFromToken = (token: string) => {
  const payload = jwt.decode(token);
  if (typeof payload !== "string" && payload.aud) {
    if (typeof payload.aud === "string") {
      return payload.aud.includes("cn") ? "cn" : "com";
    } else {
      return payload.aud.find((aud) => aud.includes("cn")) ? "cn" : "com";
    }
  }
  return "com";
};

export class TeslaAPIError extends Error {
  status?: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// 调用特斯拉API
export const callTeslaAPI = async ({ mid, method, path, query, refreshToken }: CallTeslaAPIProps) => {
  const { accessToken, region } = await getTeslaAccessToken(mid, refreshToken);
  const url = buildTeslaAPIUrl(region, path, query);
  const resp = await axios(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "",
    },
    validateStatus: () => true, // 忽略状态码错误，由调用方处理
  });

  // 统一处理部分异常
  if (resp.status === 401) {
    throw new TeslaAPIError(resp.status, "invalid refresh_token");
  }
  return resp;
};
