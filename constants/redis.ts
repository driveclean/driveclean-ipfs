// 永不过期lol
export const TTL_NEVER_EXPIRE = -1;

// 检查充电状态的cron job中sorted set的key
export const REDIS_KEY_CRON_CHECK_CHARGE_STATUS = "cron_check_charge_state";

// Tesla access_token的key前缀
export const REDIS_KEY_PREFIX_TESLA_ACCESS_TOKEN = "tesla_access_token:";

// fake充电数据检查次数
export const REDIS_KEY_PREFIX_FAKE_CHARGE_STATE_CHECK_COUNT = "fake_charge_state_check_count:";

// 充电状态hash中的特斯拉充电状态key
export const REDIS_HASH_KEY_TESLA_CHARGING_STATE = "tesla_charging_state";

// 充电状态hash中的特斯拉充电电量key
export const REDIS_HASH_KEY_TESLA_CHARG_ENERGY_ADDED = "tesla_charge_energy_added";

// 充电状态
const REDIS_KEY_PREFIX_CHAGE_STATE = "charge_state";
export const getChargeStateKey = (mid: string) => {
  return `${REDIS_KEY_PREFIX_CHAGE_STATE}:${mid}`;
};
export const REDIS_TTL_CHARGE_STATE = 60 * 60 * 24;

// 特斯拉充电状态
const REDIS_KEY_PREFIX_TESLA_CHAGE_STATE = "tesla_charge_state";
export const getTeslaChargeStateKey = (mid: string) => {
  return `${REDIS_KEY_PREFIX_TESLA_CHAGE_STATE}:${mid}`;
};
export const REDIS_TTL_TESLA_CHAGE_STATE = 60 * 60 * 24;

// 剩余充电量
export const REDIS_KEY_PREFIX_REMAINING_KWH = "remaining_kwh";
export const getRemainingKwhKey = (countingWeek: string, mid: string) => {
  return `${REDIS_KEY_PREFIX_REMAINING_KWH}:${countingWeek}:${mid}`;
};
export const REDIS_TTL_REMAINING_KWH = 60 * 60 * 24 * 7; // 剩余充电量的过期时间
