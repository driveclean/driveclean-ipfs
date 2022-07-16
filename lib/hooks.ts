import { useAppDispatch } from "app/hooks";
import { ILayout, updateLayout } from "app/reducers/layout";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { addCookie, editCookie, getCookie } from "./cookie";

/**
 * 用于从url中获取某个参数的值
 * @name name 参数名
 * @returns {string || undefined} url中该参数的值，如果没有则返回undefined
 */
export function useParam(name: string): string | undefined {
  const router = useRouter();
  const [param, setParam] = useState(null);
  useEffect(() => {
    // 当router完成加载后从query中获取参数
    if (!router.isReady || !router.query[name]) {
      setParam(undefined);
      return;
    }
    let pathName: string;
    if (typeof router.query[name] === "string") {
      pathName = router.query[name] as string;
    }
    // 若传递了多个参数，则只取第一个
    if (Array.isArray(router.query[name])) {
      pathName = router.query[name][0];
    }
    setParam(pathName);
  }, [name, router.isReady, router.query]);
  return param;
}

/**
 * 用于更新全局样式，每一个页面应调用这个hook设置全局样式或使用默认样式（可能被其他页面修改了样式）
 * @param layout 需要更新的全局样式，如果不传则使用默认全局样式
 */
export function useLayout(layout: ILayout = {}): void {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(updateLayout(layout));
  }, [dispatch, layout]);
}

/**
 * 倒计时hook
 * @returns
 */
export const useCountdown = (name: string, initial: number = 60) => {
  const [count, setCount] = useState<number>(); // 倒计时剩余时间
  const timerRef = useRef<NodeJS.Timer>(); // 倒计时的setInterval
  useEffect(() => {
    const originCountdown = getCookie(name);
    if (originCountdown) {
      let countdown = parseInt(originCountdown);
      if (isNaN(countdown)) {
        countdown = initial;
      }
      setCount(countdown);
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          if (countdown <= 0) {
            clearInterval(timerRef.current);
          } else {
            countdown--;
          }
          if (setCount) {
            setCount(countdown);
          }
          editCookie(name, countdown, countdown + 1);
        }, 1000);
      }
    }
  }, [initial, name]);

  /**
   * 开始倒计时
   * @param name cookie名称
   * @param initial 倒计时初始值
   * @param setCount 倒计时的state setter
   */
  const startCounting = (): number | undefined => {
    const originCountdown = getCookie(name);
    let countdown = initial;
    // 如果cookie无该倒计时则新增，否则直接从cookie中的时间开始倒数
    if (typeof originCountdown === "undefined") {
      addCookie(name, initial, initial);
    } else {
      countdown = parseInt(originCountdown);
    }
    const timer = setInterval(() => {
      if (countdown <= 0) {
        clearInterval(timer);
      } else {
        countdown--;
      }
      if (setCount) {
        setCount(countdown);
      }
      editCookie(name, countdown, countdown + 1);
    }, 1000);
    // 如果cookie中无该倒计时则返回undefined，有则返回实际时间，用于判断是否已处于倒计时中
    return typeof originCountdown === "undefined" ? undefined : countdown;
  };

  return { count, startCounting };
};

/**
 * 判断是否移动端
 * @returns 是否移动端
 */
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobileMatched = userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i);
    if (isMobileMatched) {
      setIsMobile(true);
    }
  }, []);
  return isMobile;
};
