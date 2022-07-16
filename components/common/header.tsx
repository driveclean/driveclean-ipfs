import Link from "next/link";
import { useRef } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { useRouter } from "next/router";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { selectLayout } from "app/reducers/layout";
import { BASE_PATH } from "constants/constants";

export default function Header() {
  const router = useRouter();
  const layout = useSelector(selectLayout); // 获取全局layout状态

  const avatarRef = useRef(null); // 此处ref供react-lottie-player使用
  const backToRef = useRef(null); // 此处ref供react-lottie-player使用
  const walletRef = useRef(null); // 此处ref供react-lottie-player使用
  return (
    <header className={classNames(["sticky top-0 w-full py-4 px-8 flex items-center z-50", layout.headerStyle])}>
      {/* 如果需要返回按钮，则用返回按钮替代用户头像 */}
      {layout.isNeedBack ? (
        <div className="w-10 h-10 flex items-center">
          <div className="w-8 h-8 rounded-full shadow-md bg-white" onClick={() => router.back()}>
            <Player
              ref={backToRef}
              src="/icons/back-to.json"
              style={{ width: "2rem", height: "2rem" }}
              autoplay
              hover
            ></Player>
          </div>
        </div>
      ) : (
        <Link href={{ pathname: BASE_PATH, query: { p: "profile" } }} passHref>
          <div className="relative w-10 h-10 rounded-full shadow-md">
            <Player
              ref={avatarRef}
              src="/icons/circled-user-male-skin-type-4.json"
              style={{ width: "2.5rem", height: "2.5rem" }}
              autoplay
              hover
            ></Player>
          </div>
        </Link>
      )}
      <div className="flex-1 flex justify-center items-center text-xl sm:text-2xl font-bold text-gray-900">
        {layout.title}
      </div>
      {layout.isNeedWallet ? (
        <Link href={{ pathname: BASE_PATH, query: { p: "wallet" } }} passHref>
          <div className="relative w-10">
            <Player
              ref={walletRef}
              src="/icons/wallet.json"
              style={{ width: "2.5rem", height: "2.5rem" }}
              autoplay
              hover
            ></Player>
          </div>
        </Link>
      ) : (
        <div className="relative w-10" />
      )}
    </header>
  );
}
