import { BASE_PATH, DC_TOKEN_COOKIE_NAME } from "constants/constants";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest, event: NextFetchEvent) {
  // Add the user token to the response
  const token = req.cookies[DC_TOKEN_COOKIE_NAME];
  const p = req.nextUrl.searchParams.get("p");

  // 如果没有token则跳向登录页
  if (typeof token === "undefined") {
    if (!p || p === "login") {
      return;
    }
    return NextResponse.redirect(new URL(`${BASE_PATH}?p=login`, req.url));
  }

  // 如果已登录，则跳向首页
  if (req.nextUrl.pathname === BASE_PATH && (!p || p === "login")) {
    return NextResponse.redirect(new URL(`${BASE_PATH}?p=space`, req.url));
  }
  return;
}
