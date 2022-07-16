import { serialize, CookieSerializeOptions } from "cookie";
import { NextApiResponse } from "next";

/**
 * 添加 cookie
 * @param name 名称
 * @param value 值
 * @param ttl 过期时间 单位: 秒
 */
export function addCookie(name, value, ttl) {
  let cookieString = `${name}=${encodeURI(value)}`;
  // 判断是否设置过期时间,0代表关闭浏览器时失效
  if (ttl > 0) {
    const date = new Date();
    date.setTime(date.getTime() + ttl * 1000);
    cookieString = `${cookieString};expires=${date.toUTCString()}`;
  }
  document.cookie = cookieString;
}

/**
 * 修改 cookie
 * @param name 名称
 * @param value 值
 * @param ttl 过期时间 单位: 秒
 */
export function editCookie(name, value, ttl) {
  let cookieString = `${name}=${encodeURI(value)}`;
  if (ttl > 0) {
    const date = new Date();
    date.setTime(date.getTime() + ttl * 1000); // 单位是毫秒
    cookieString = `${cookieString};expires=${date.toUTCString()}`;
  }
  document.cookie = cookieString;
}

/**
 * 根据名字获取cookie的值
 * @param name
 */
export function getCookie(name: string) {
  const strCookie = document.cookie;
  const arrCookie = strCookie.split("; ");
  for (const cookie of arrCookie) {
    const arr = cookie.split("=");
    if (arr[0] === name) {
      return decodeURI(arr[1]);
    }
  }
}

/**
 * 为api响应设置set-cookie头
 */
export const setCookie = (res: NextApiResponse, name: string, value: unknown, options: CookieSerializeOptions = {}) => {
  const stringValue = typeof value === "object" ? "j:" + JSON.stringify(value) : String(value);

  if ("maxAge" in options) {
    options.expires = new Date(Date.now() + options.maxAge);
    options.maxAge /= 1000;
  }

  res.setHeader("Set-Cookie", serialize(name, stringValue, options));
};

/**
 * 删除一个cookie
 * @param name cookie名称
 * @param param path domain 路径 域名
 */
export const removeCookie = (name: string, { path, domain }: { path?: string; domain?: string } = {}) => {
  console.log(7777);
  if (getCookie(name)) {
    console.log(123123);
    document.cookie =
      name +
      "=" +
      (path ? ";path=" + path : "") +
      (domain ? ";domain=" + domain : "") +
      ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
};
