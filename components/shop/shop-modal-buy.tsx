import Button from "@components/common/button";
import { useLoading } from "@components/common/loading-provider";
import { useModal } from "@components/common/modal-provider";
import useDC from "@lib/dc/dc";
import { IItem } from "@model/model";
import Image from "next/image";
import { ResDataForPurchaseNFTCar } from "pages/api/nft/purchase_nft_car";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

/**
 * 购买nft的信息弹窗
 * @param param item nft信息
 * @param cleanUpAfterSuccess 购买成功后调用的函数（如，重新读取上架商品列表）
 * @returns 购买nft的信息弹窗
 */
export default function ModalBuy({ item, cleanUpAfterSuccess }: { item: IItem; cleanUpAfterSuccess?: () => void }) {
  const { setModal } = useModal();
  const { connected, call, pay } = useDC();
  const { setLoading } = useLoading();
  const [isPaying, setIsPaying] = useState(false);
  const buyItem = useCallback(async () => {
    setLoading({ visible: true, message: "Purchasing item..." });
    setIsPaying(true);
    const payResp = await pay({ amount: item.price });
    if (payResp) {
      setIsPaying(false);
    } else {
      return;
    }

    const withdrawNFTResp = await call({
      method: "post",
      path: "/balance/withdraw_nft",
      data: {
        mint: item.mint_address,
      },
    });
    if (withdrawNFTResp?.msg !== "ok") {
      return;
    }
    console.log(withdrawNFTResp);

    const resp: ResDataForPurchaseNFTCar = await call({
      method: "post",
      path: "/nft/purchase_nft_car",
      data: {
        id: item.nid,
      },
    });
    console.log("resp", resp);

    setLoading({ visible: false });

    if (resp?.msg === "ok") {
      toast.success("Purchase success!");
      cleanUpAfterSuccess();
      setModal({ visible: false });
    }
  }, [call, cleanUpAfterSuccess, item.mint_address, item.nid, item.price, pay, setLoading, setModal]);

  useEffect(() => {
    if (connected && isPaying) {
      buyItem();
    }
  }, [buyItem, connected, isPaying]);

  return (
    <div className="relative w-full p-8 flex flex-col justify-center items-center">
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
      <div className="w-8/12 flex justify-between">
        <span className="text-base sm:text-lg text-gray-400 font-semibold">Cost</span>
        <span className="text-base sm:text-lg text-gray-900 font-semibold">{item.price} SOL</span>
      </div>
      <div className="w-full flex justify-center items-center space-x-4">
        <Button
          type="button"
          style="min-h-0 h-10 bg-opacity-0 hover:bg-opacity-10 focus:bg-opacity-20"
          onClick={() => setModal({ visible: false })}
        >
          CANCEL
        </Button>
        <Button type="button" style="min-h-0 h-10" onClick={buyItem}>
          CONFIRM
        </Button>
      </div>
    </div>
  );
}
