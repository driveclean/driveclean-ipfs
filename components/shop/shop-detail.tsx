import Button from "@components/common/button";
import Modal from "@components/common/modal";
import { useModal } from "@components/common/modal-provider";
import { useLayout, useParam } from "@lib/hooks";
import { IItem } from "@model/model";
import classNames from "classnames";
import Image from "next/image";
import { useState } from "react";
import ModalBuy from "./shop-modal-buy";

const fakeCarList = [
  { nid: "1", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "11.17" },
  { nid: "2", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "18.69" },
  { nid: "3", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "6.32" },
  { nid: "4", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "8.83" },
  { nid: "5", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "999.99" },
  { nid: "6", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "11.17" },
  { nid: "7", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "18.69" },
  { nid: "8", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "6.32" },
  { nid: "9", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "11.17" },
  { nid: "10", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "18.69" },
  { nid: "11", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "6.32" },
  { nid: "12", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "8.83" },
  { nid: "13", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "999.99" },
  { nid: "14", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "11.17" },
  { nid: "15", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "18.69" },
  { nid: "16", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "6.32" },
  { nid: "17", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "8.83" },
];

/**
 * nft商品详情页面
 * @returns nft商品详情页面
 */
export default function ShopDetail() {
  useLayout({ isNeedBack: true });
  const { setModal } = useModal();
  const nid = useParam("nid");
  let item: IItem;
  fakeCarList.some((i) => {
    item = i as IItem;
    return item.nid === nid;
  });
  return (
    <div className="relative w-full px-8 animate-in fade-in duration-500 flex-1 flex flex-col">
      <div className="relative w-full p-8 flex flex-col justify-center items-center bg-white rounded-3xl border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900">
        <div className="relative text-xl sm:text-2xl font-bold text-gray-900 ">BUY</div>
        <div className="w-full h-20 my-2 flex justify-center items-center">
          <div className="relative w-20 h-20">
            <Image src={item.pic} layout="fill" objectFit="fill" alt="" />
          </div>
        </div>
        <div className="w-8/12 border-2 border-gray-900 rounded-full p-1 flex text-xs sm:text-sm">
          <span className="w-4 sm:w-5 h-4 sm:h-5 bg-gray-900 rounded-full text-white flex justify-center items-center flex-shrink-0">
            #
          </span>
          <span className="w-full flex justify-center items-center">{item.nid}</span>
        </div>
        <div className="w-8/12 py-1 flex justify-between items-center text-xs sm:text-sm">
          <span>Mint: {item.mint}</span>
          <span>Lv {item.level}</span>
        </div>
      </div>
      <div className="relative flex-1"></div>
      <div
        className={classNames([
          "sticky bottom-0 w-full animate-in fade-in duration-500",
          "pb-[max(1rem,constant(safe-area-inset-bottom))]",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        ])}
      >
        <div className="relative w-full px-4 py-2 bg-green-50 border-2 border-green-200 rounded-full flex flex-row justify-between items-center">
          <span className="text-base sm:text-lg text-gray-900 font-semibold">{item.price} SOL</span>
          <Button
            type="button"
            style="min-h-0 h-10"
            onClick={() => setModal({ visible: true, children: <ModalBuy item={item} /> })}
          >
            BUY NOW
          </Button>
        </div>
      </div>
    </div>
  );
}
