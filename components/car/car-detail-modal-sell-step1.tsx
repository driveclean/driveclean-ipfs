import Button from "@components/common/button";
import { useModal } from "@components/common/modal-provider";
import { IItem } from "@model/model";
import Image from "next/image";
import ModalSellStep2 from "./car-detail-modal-sell-step2";
import ModalLevelUp from "./car-modal-level-up";

/**
 * 升级Car NFT的弹窗
 * @param IItem Car NFT
 * @returns
 */
export default function ModalSellStep1({ item }: { item: IItem }) {
  const { setModal } = useModal();
  return (
    <div className="relative w-full p-4 flex flex-col justify-center items-center">
      <div className="relative w-60 h-40">
        {item?.pic && <Image src={item?.pic} layout="fill" objectFit="fill" alt="" />}
      </div>
      <div className="relative w-full rounded-xl bg-gray-100 border-2 border-gray-700 grid grid-cols-2 gap-y-4 p-4 gap-x-8">
        <div className="col-span-1 flex flex-col">
          <span className="text-sm font-semibold text-gray-400">Type</span>
          <span className="font-semibold text-gray-900">{item.type}</span>
        </div>
        <div className="col-span-1 flex flex-col">
          <span className="text-sm font-semibold text-gray-400">Level</span>
          <span className="font-semibold text-gray-900">{item.level}</span>
        </div>
        <div className="col-span-1 flex flex-col">
          <span className="text-sm font-semibold text-gray-400">Durability</span>
          <span className="font-semibold text-gray-900">{item.attribute_durability}</span>
        </div>
        <div className="col-span-1 flex flex-col">
          <span className="text-sm font-semibold text-gray-400">Mint</span>
          <span className="font-semibold text-gray-900">{item.mint}</span>
        </div>
      </div>

      <div className="mt-8 w-full flex justify-center items-center space-x-4">
        <Button
          type="button"
          style="min-h-0 h-10 bg-opacity-0 hover:bg-opacity-10 focus:bg-opacity-20"
          onClick={() => setModal({ visible: false })}
        >
          CANCEL
        </Button>
        <Button
          type="button"
          style="min-h-0 h-10"
          onClick={() => setModal({ visible: true, title: "Sell", children: <ModalSellStep2 item={item} /> })}
        >
          NEXT
        </Button>
      </div>
    </div>
  );
}
