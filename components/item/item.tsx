import { useModal } from "@components/common/modal-provider";
import ModalBuy from "@components/shop/shop-modal-buy";
import { IItem } from "@model/model";
import { BASE_PATH } from "constants/constants";
import Image from "next/image";
import Link from "next/link";

/**
 * nft卡片
 * @param item 物品信息
 * @param location 组件使用位置 storage Shop
 * @param cleanUpAfterSuccess 购买成功后调用的函数（如，重新读取上架商品列表）
 * @returns
 */
export default function Item({
  item,
  location,
  cleanUpAfterSuccess,
}: {
  item: IItem;
  location: string;
  cleanUpAfterSuccess?: () => void;
}) {
  const { setModal } = useModal();
  return (
    <div
      key={item.nid}
      className="col-span-1 w-full border-2 border-gray-900 rounded-xl shadow-[2px_2px] shadow-gray-900 flex flex-col items-center overflow-hidden text-gray-900"
    >
      <Link href={location === "shop" ? `${BASE_PATH}?p=shop_detail&nid=${item.nid}` : `${BASE_PATH}?p=car_detail&carid=${item.nid}`} passHref>
        <div className="relative w-full flex flex-col items-center">
          <div className="w-8/12 flex justify-center bg-green-100 rounded-b-md">
            <span className="text-sm sm:text-base">
              {item.type === "car" && "Car"}
              {item.type === "part" && "Part"}
            </span>
          </div>
          <div className="w-full h-20 my-2 flex justify-center items-center">
            <div className="relative w-full h-full">
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
      </Link>
      {location === "shop" && (
        <div className="w-full h-10 bg-green-100 flex justify-center items-center space-x-2">
          <span className="text-sm font-semibold">{item.price} SOL</span>
          <button
            type="button"
            className="btn w-12 min-w-0 h-fit min-h-0 rounded-full bg-green-200 hover:bg-green-300 focus:bg-green-300 text-gray-900 border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900 text-sm"
            onClick={() =>
              setModal({ visible: true, children: <ModalBuy item={item} cleanUpAfterSuccess={cleanUpAfterSuccess} /> })
            }
          >
            BUY
          </button>
        </div>
      )}
    </div>
  );
}
