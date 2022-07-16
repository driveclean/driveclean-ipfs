import { useLoading } from "@components/common/loading-provider";
import { sign } from "@lib/api/middlewares/verify";
import { getCookie, removeCookie } from "@lib/cookie";
import { useMobile, useParam } from "@lib/hooks";
import logger from "@lib/logger";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-wallets";
import { useAppDispatch, useAppSelector } from "app/hooks";
import axios, { AxiosResponse } from "axios";
import base58 from "bs58";
import {
  BACKEND_BASE_URL,
  BASE_PATH,
  DC_NONCE_HEADER_NAME,
  DC_SIGN_HEADER_NAME,
  DC_TIMESTAMP_HEADER_NAME,
  DC_TOKEN_COOKIE_NAME,
} from "constants/constants";
import { randomBytes } from "crypto";
import { SignInReq } from "pages/api/sign_in";
import { useCallback, useEffect, useRef, useState } from "react";
import jwt from "jsonwebtoken";
import { TokenPayload } from "@model/model";
import user, { selectUser, updateUser } from "app/reducers/user";
import { useModal } from "@components/common/modal-provider";
import { useRouter } from "next/router";
import nacl from "tweetnacl";
import { selectBucket } from "app/reducers/bucket";
import Button from "@components/common/button";
import { DateTime } from "luxon";
import { toast } from "react-toastify";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import np from "number-precision";

// axios实例配置
const instance = axios.create({
  baseURL: BACKEND_BASE_URL,
  // TODO: timeout should not over 20000
  // timeout: 10000,
  timeout: 100000,
  withCredentials: true,
});

// useDC中call方法的类型定义
export type DCCall = <Data = any, Resp = any>({
  method,
  path,
  params,
  data,
}: {
  method: "get" | "GET" | "post" | "POST";
  path: string;
  params?: {} | URLSearchParams;
  data?: Data;
  auth?: boolean;
}) => Promise<Resp>;

/**
 * 前后端交互、web3交互的hook封装，所有需要进行后端接口调用、钱包交互的组件都应使用该方法
 * 为保证pc和mobile上游编码统一，相同操作均应在该hook中同名方法内完成
 *
 * 此处使用的钱包库：@solana/wallet-adapter-react，详见：https://github.com/solana-labs/wallet-adapter
 */
export default function useDC() {
  const router = useRouter(); // nextjs的router hook
  const p = useParam("p");
  const [token, setToken] = useState(getCookie(DC_TOKEN_COOKIE_NAME)); // 从cookie中获取token
  const { setLoading } = useLoading(); // 设置loading
  const { setModal } = useModal(); // 设置modal
  const isMobile = useMobile(); // 是否移动端
  const { connected, wallet, publicKey, select, connect, disconnect, signMessage, sendTransaction } = useWallet();
  const [isWalletSelecting, setIsWalletSelecting] = useState(true); // 是否正在选择钱包中
  const [isSigningIn, setIsSigningIn] = useState(false); // 是否正在登录中
  const dispatch = useAppDispatch();
  const { connection } = useConnection();

  /**
   * 接口调用封装，所有后端接口调用均需使用该方法
   * @param method 请求方法，仅限GET或POST
   * @param url 请求地址，无需携带base url
   * @param params url中的参数
   * @param data body中的参数
   */
  const call = useCallback<DCCall>(
    async ({ method, path, params, data }) => {
      let response: AxiosResponse<any, any>;
      try {
        const headers = {} as any;
        const timestamp = DateTime.now().toSeconds().toString();
        const nonce = base58.encode(nacl.randomBytes(24));
        headers[DC_TIMESTAMP_HEADER_NAME] = timestamp;
        headers[DC_NONCE_HEADER_NAME] = nonce;
        headers[DC_SIGN_HEADER_NAME] = sign(timestamp, nonce, method, path, params, data); // 对请求进行签名

        response = await instance({
          method: method,
          url: path,
          params: params,
          data: data,
          headers: headers,
          validateStatus: (status) => {
            return (status >= 200 && status < 300) || status === 401 || status === 403;
          },
        });

        if (response.status === 401 || response.status === 403) {
          router.push({ pathname: BASE_PATH, query: { p: "login" } });
          return;
        }
        return response.data;
      } catch (e) {
        toast.error("Something wrong, please try again later");
        logger.error(
          `[useDC] bad call, method: ${method}, path: ${path}, params: ${JSON.stringify(
            params
          )}, data: ${JSON.stringify(data)}, error: ${e.message}`
        );
        return;
      } finally {
        // 判断token是否被更新，如果更新则更新用户信息
        const newToken = getCookie(DC_TOKEN_COOKIE_NAME);
        if (token !== newToken) {
          setToken(newToken);
          const user = jwt.decode(newToken) as TokenPayload;
          dispatch(updateUser(user));
        }
      }
    },
    [dispatch, router, token]
  );

  // 由于adapter加载并未提供promise方法，但又需要时间加载，所以打开页面首先加载钱包adapter
  useEffect(() => {
    if (isMobile && !token) {
      setIsSigningIn(true);
      setLoading({ visible: false });
      return;
    }
    if (!wallet && isWalletSelecting) {
      setLoading({ visible: true });
      select(PhantomWalletName); // 当前固定使用Phantom
      return;
    }
    if (wallet && isWalletSelecting) {
      setIsWalletSelecting(false);
      setLoading({ visible: false });
    }
  }, [isMobile, isWalletSelecting, select, setLoading, token, wallet]);

  // 连接钱包
  const login = useCallback(async () => {
    try {
      if (!(window as any).solana) {
        setModal({
          visible: true,
          title: "Install a wallet to continue...",
          children: (
            <div className="relative w-full flex flex-col justify-center items-center">
              <Button
                onClick={async () => {
                  window.open(wallet.adapter.url, "_blank");
                }}
                style="w-full min-h-0 h-10"
              >
                Install Phantom
              </Button>
              <div className="mt-2 text-xs text-gray-400 italic">
                Refresh after installed on PC or open in the browser built in the wallet on mobile
              </div>
            </div>
          ),
        });
        return;
      }
      if (!connected || !token) {
        setLoading({ visible: true, message: "Connecting Wallet..." });
        // 获取钱包扩展是否已安装
        if (wallet && wallet.readyState === WalletReadyState.NotDetected) {
          console.log(wallet.readyState);
          // TODO: Pop a modal to tell user to install wallet
          setModal({ visible: true, children: <div>Install Wallet</div> });
          setLoading({ visible: false });
          return;
        }
        await connect();
        setIsSigningIn(true);
      }
    } catch (e) {
      setModal({
        visible: true,
        title: "Oops!",
        children: <div className="text-sm sm:text-base">{e.message}</div>,
      });
      logger.error(`[useDC] connectWallet error, isMobile: ${isMobile}, err: ${e.message}`);
    } finally {
      setLoading({ visible: false });
    }
  }, [connect, connected, isMobile, setLoading, setModal, token, wallet]);

  // 与钱包断开连接
  const logout = useCallback(async () => {
    if (connected) {
      await disconnect();
    }
    dispatch(updateUser({}));
    removeCookie(DC_TOKEN_COOKIE_NAME);
  }, [connected, disconnect, dispatch]);

  // 发起对消息签名
  const signMessageWallet = useCallback(
    async (message: string) => {
      if (!signMessage) throw new Error("Wallet does not support message signing!");
      return signMessage(new TextEncoder().encode(message));
    },
    [signMessage]
  );

  // 发起一笔交易
  const pay = useCallback(
    async ({ amount }: { amount: string }) => {
      if (!connected) {
        await connect();
        return;
      }
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(process.env.NEXT_PUBLIC_SOL_REVEIVER_PUB),
          lamports: np.times(LAMPORTS_PER_SOL, amount),
        })
      );

      const signature = await sendTransaction(transaction, connection);

      return await connection.confirmTransaction(signature, "processed");
    },
    [connect, connected, connection, publicKey, sendTransaction]
  );

  // 登录
  // 由于connect的promise方法await后并非完成连接，存在connecting中间态，所以需要用这种方式异步处理
  useEffect(() => {
    // 如果钱包未连接、已有token或未在登录中状态
    if (!(window as any).solana || !router.isReady || !connected || !isSigningIn || token) return;
    const f = async () => {
      try {
        // 验证用户是否拥有私钥（即尝试对消息签名）
        const message = randomBytes(32).toString("hex");
        setLoading({ visible: true, message: `Signing message in your wallet: ${message}` });
        const signature = await signMessageWallet(message);

        if (!publicKey) throw new Error("Wallet not connected!");
        const wallet_pub = publicKey.toBase58();
        setLoading({ visible: true, message: "Signing in..." });
        await call({
          method: "post",
          path: "/sign_in",
          data: { wallet_pub: wallet_pub, message, signature: base58.encode(signature) } as SignInReq,
        });
        const newToken = getCookie(DC_TOKEN_COOKIE_NAME);
        setToken(newToken);
        if (!newToken) {
          throw new Error("Something wrong, Please try again...");
        }
        const user = jwt.decode(newToken) as TokenPayload;
        dispatch(updateUser(user));
        if (!router.isReady) return;
        console.log(p);
        if (typeof p === "undefined" || p === "login") {
          router.replace({ pathname: BASE_PATH, query: { p: "space" } });
        }
      } catch (e) {
        setModal({
          visible: true,
          title: "Oops!",
          children: <div className="text-sm sm:text-base">{e.message}</div>,
        });
        logger.error(`[useDC] when pc login: ${e.message}`);
      } finally {
        setIsSigningIn(false);
        setLoading({ visible: false });
      }
    };
    f();
  }, [call, connected, dispatch, isSigningIn, p, publicKey, router, setLoading, setModal, signMessageWallet, token]);

  return { token, connected, call, login, logout, pay };
}
