import { ApiRequest } from "@model/model";
import pino from "pino";
import { createPinoBrowserSend, createWriteStream, logflarePinoVercel } from "pino-logflare";

// 创建Logflare的日志发送stream和send
// Logflare：https://logflare.app/
// create pino-logflare stream
// const stream = createWriteStream({
//   apiKey: process.env.NEXT_PUBLIC_LOGFLARE_API_KEY,
//   sourceToken: process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN,
// });

// create pino-logflare browser stream
// const send = createPinoBrowserSend({
//   apiKey: process.env.NEXT_PUBLIC_LOGFLARE_API_KEY,
//   sourceToken: process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN,
// });

// create pino-logflare console stream for serverless functions and send function for browser logs
const { stream, send } = logflarePinoVercel({
  apiKey: process.env.NEXT_PUBLIC_LOGFLARE_API_KEY,
  sourceToken: process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN,
});

interface CustomLogger extends pino.Logger {
  logErrorReq: (req: ApiRequest<any, any>, e: Error) => void;
  infoc: (req: ApiRequest<any, any>, msg: string) => void;
  warnc: (req: ApiRequest<any, any>, msg: string) => void;
  errorc: (req: ApiRequest<any, any>, msg: string) => void;
}

// 创建pino的单例logger并配置
const logger = pino(
  {
    browser: {
      // client端日志配置
      transmit: {
        level: "info",
        send: send,
      },
    },
    level: "debug", // server端日志配置
    base: {
      env: process.env.VERCEL_ENV || "unknown",
      revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
    },
  },
  stream
) as CustomLogger;

logger.logErrorReq = (req: ApiRequest<any, any>, e: Error) => {
  logger.error(
    `[${req?.url}] params: ${JSON.stringify(req?.params)}, body: ${JSON.stringify(req?.data)}, err: ${e?.message}`
  );
};

logger.infoc = (req: ApiRequest<any, any>, msg: string) => {
  logger.info(`[${req?.url}] ${msg}`);
};

logger.warnc = (req: ApiRequest<any, any>, msg: string) => {
  logger.warn(`[${req?.url}] ${msg}`);
};

logger.errorc = (req: ApiRequest<any, any>, msg: string) => {
  logger.error(`[${req?.url}] ${msg}`);
};

export default logger;
