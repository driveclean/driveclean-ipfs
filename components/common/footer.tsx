import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Player } from "@lottiefiles/react-lottie-player";
import { useRouter } from "next/router";
import { useParam } from "@lib/hooks";
import { BASE_PATH } from "constants/constants";

const routesWithFooter = ["space", "storage", "shop"]; // 需要使用footer的路由

export default function Footer() {
  const p = useParam("p");
  const homeIconRef = useRef(null); // 此处ref供react-lottie-player使用
  const carIconRef = useRef(null); // 此处ref供react-lottie-player使用
  const cartIconRef = useRef(null); // 此处ref供react-lottie-player使用
  return (
    <footer
      className={classNames([
        !routesWithFooter.includes(p) && "hidden",
        "sticky bottom-0 w-full px-8 pt-4 animate-in fade-in duration-500",
        "pb-[max(1rem,constant(safe-area-inset-bottom))]",
        "pb-[max(1rem,env(safe-area-inset-bottom))]",
      ])}
    >
      {/* space */}
      <div className="relative w-full h-14 bg-green-50 border-2 border-green-200 rounded-full flex flex-row justify-around items-center">
        <Link href={{ pathname: BASE_PATH, query: { p: "space" } }} shallow replace passHref>
          <div className="relative w-12 h-8 flex justify-center items-center">
            {p === "space" && <div className="absolute w-12 h-6 bg-green-200 rounded-full" />}
            <div className="relative w-8 h-8">
              <Player
                ref={homeIconRef}
                src="/icons/home.json"
                style={{ width: "2rem", height: "2rem" }}
                autoplay={p === "space"}
                hover
              ></Player>
            </div>
          </div>
        </Link>
        {/* storage */}
        <Link href={{ pathname: BASE_PATH, query: { p: "storage" } }} shallow replace passHref>
          <div className="relative w-12 h-8 flex justify-center items-center">
            {p === "storage" && <div className="absolute w-12 h-6 bg-green-200 rounded-full" />}
            <div className="relative w-10 h-10">
              <Player
                ref={carIconRef}
                src="/icons/car.json"
                style={{ width: "2.5rem", height: "2.5rem" }}
                autoplay={p === "storage"}
                hover
              ></Player>
            </div>
          </div>
        </Link>
        {/* shop */}
        <Link href={{ pathname: BASE_PATH, query: { p: "shop" } }} shallow replace passHref>
          <div className="relative w-12 h-8 flex justify-center items-center">
            {p === "shop" && <div className="absolute w-12 h-6 bg-green-200 rounded-full" />}
            <div className="relative w-8 h-8">
              <Player
                ref={cartIconRef}
                src="/icons/shopping-cart.json"
                style={{ width: "2rem", height: "2rem" }}
                autoplay={p === "shop"}
                hover
              ></Player>
            </div>
          </div>
        </Link>
      </div>
    </footer>
  );
}
