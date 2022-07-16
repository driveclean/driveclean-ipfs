import { NextApiRequest } from "next";

/**
 * nft信息
 */
export interface IItem {
  nid: string; // nft id
  mint_address: string; // mint address
  type: string; // nft类型
  pic: string; // nft图片
  mint: number; // nft的mint次数
  level: number; // nft等级
  price: string; // nft价格
  rarity: string; // nft稀有度
  lifespan: number; // nft的生命周期
  attribute_horsepower: number;
  attribute_durability: number;
  attribute_luckiness: number;
  depreciation: number;
  royalties: number; // artist royalties
}

/**
 * 用户信息
 */
export interface IUser {
  mid: string; // 用户id
  uname: string; // 用户名称
  email: string; // 用户邮箱
  pub: string;
  sec: string;
}

/**
 * 封装校验后的接口请求内容
 */
export interface ApiRequest<T, U> extends NextApiRequest {
  params: T; // url参数
  data: U; // body参数
  user: TokenPayload; // 用户信息
  token: string; // token
}

/**
 * JWT Payload
 */
export interface TokenPayload {
  mid?: string; // 用户id
  wallet_pub?: string; // 钱包公钥
  wallet_token?: string; // 钱包token
  wallet_type?: string; // 钱包类型
  email?: string; // 邮箱
  is_email_verified?: boolean; // 邮箱是否已验证
  uname?: string; // 用户名
  face?: string; // 头像
  sex?: number; // 性别 0 secret 1 female 2 male
  last_login_time?: string; // 最后登录时间
  is_set_tesla_refresh_token?: boolean; // Tesla的refresh_token是否已设置
  vehicle_id?: string; // 车辆id
}

/**
 * Cron JWT Payload
 */
export interface CronTokenPayload {
  source?: string; // 调用来源
  type?: string; // 调用类型
  name?: string; // 调用任务
}
