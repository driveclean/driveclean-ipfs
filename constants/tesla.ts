export const TESLA_TOKEN_URL = "https://auth.tesla.com/oauth2/v3/token"; // 获取tesla token的url
export const TESLA_TOKEN_URL_CN = "https://auth.tesla.cn/oauth2/v3/token"; // 获取tesla token的url（中国大陆）
export const TESLA_API_BASE_URL = "https://owner-api.teslamotors.com/api/1"; // Tesla接口的基础url
export const TESLA_API_BASE_URL_CN = "https://owner-api.vn.cloud.tesla.cn/api/1"; // Tesla接口的基础url（中国大陆）

export const TESLA_TOKEN_GRANT_TYPE = "refresh_token"; // Tesla token的grant_type
export const TESLA_TOKEN_CLIENT_ID = "ownerapi"; // Tesla token的client_id
export const TESLA_TOKEN_SCOPE = "openid email offline_access"; // Tesla token的scope

export const CHARGING_STATE_DISCONNECTED = "Disconnected"; // 充电状态: 断开
export const CHARGING_STATE_READY_TO_CHARGE = "NoPower"; // 充电状态: 准备充电
export const CHARGING_STATE_CHARGING = "Charging"; // 充电状态: 充电中
export const CHARGING_STATE_COMPLETE = "Complete"; // 充电状态: 充电完成
