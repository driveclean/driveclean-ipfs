export const EMAIL_VERIFY_CODE_KEY = "dcevc"; // 邮箱验证码key
export const EMAIL_VERIFY_CODE_EXPIRED_TIME = 60; // 邮箱验证码过期时间，单位为秒

export const DC_TIMESTAMP_HEADER_NAME = "x-dc-timestamp"; // 签名header名称
export const DC_NONCE_HEADER_NAME = "x-dc-nonce"; // 签名header名称
export const DC_SIGN_HEADER_NAME = "x-dc-sign"; // 签名header名称
export const DC_TOKEN_COOKIE_NAME = "dc-token"; // token cookie名称

export const BASE_PATH = "/alpha"; // 基础路径
export const BACKEND_BASE_URL = "/api"; // 后端接口基础路径

export const PHANTOM_DEEPLINK_BASE_URL = "https://phantom.app/ul/v1/"; // phantom钱包deeplink基础url

export const CHARGE_STATE_CHECK_INTERVAL = 600; // 查询充电状态的时间间隔，单位为秒

export const POWER_FACTOR = 100; // 每1点Power可充的电量
export const EARNING_FACTOR_L1 = 0.9; // 收益随机乘数下限
export const EARNING_FACTOR_L2 = 1.1; // 收益随机乘数上限

export const NUMBER_DECIMALS = 2; // 数字保留小数位数
export const TOKEN_DECIMALS = 9; // token保留小数位数

export const FIGMENT_DATAHUB_SOLANA_API_URL = `https://solana--${process.env.NEXT_PUBLIC_SOLANA_NETWORK}.datahub.figment.io/apikey/${process.env.NEXT_PUBLIC_FIGMENT_DATAHUB_API_KEY}`; // figment datahub solana api url

export const MAX_MINT_TIMES = 10; // 每个nft最多可以mint的次数

export const PINATA_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/"; // Pinata ipfs gateway url
