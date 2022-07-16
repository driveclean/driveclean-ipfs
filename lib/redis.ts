import Redis from "ioredis";
import logger from "./logger";

const redis = new Redis(process.env.REDIS_URL);

export default redis;

export const REDIS_KEY_PREFIX_LOCK = "lock";

/**
 * 通过redis加锁
 * @param lockKey 锁的key
 * @param lockValue 锁的值，防止误解锁
 * @param ttl 锁的时间，单位秒
 * @returns 是否上锁成功
 */
export const lock = async (lockKey: string, lockValue: string, ttl: number = 1): Promise<boolean> => {
  let lockStatus = 0;
  try {
    lockStatus = (await redis.eval(
      "if (redis.call('setnx',KEYS[1],ARGV[1]) < 1) then return 0; end; redis.call('expire',KEYS[1],tonumber(ARGV[2])); return 1;",
      1,
      lockKey,
      lockValue,
      ttl
    )) as number;
  } catch (e) {
    logger.error(`[lock] redis lock error: ${e.message}, lockKey: ${lockKey}, lockValue: ${lockValue}`);
  } finally {
    return lockStatus === 1;
  }
};

export const unlock = async (lockKey: string, lockValue: string) => {
  try {
    const unlockStatus = await redis.eval(
      "if (redis.call('get', KEYS[1]) == ARGV[1]) then return redis.call('del', KEYS[1]); else return 0; end;",
      1,
      lockKey,
      lockValue
    );
    if (unlockStatus !== 1) {
      logger.error(`[unlock] unlocking expired lock, lockKey: ${lockKey}, lockValue: ${lockValue}`);
    }
  } catch (error) {
    logger.error(`[unlock] redis unlock error: ${error.message}, lockKey: ${lockKey}, lockValue: ${lockValue}`);
  }
};
