import Button from "@components/common/button";
import { useLoading } from "@components/common/loading-provider";
import { useModal } from "@components/common/modal-provider";
import useDC from "@lib/dc/dc";
import { calcLevelUpCost } from "@lib/game-logic";
import { IItem, TokenPayload } from "@model/model";
import { toast } from "react-toastify";

/**
 * 升级Car NFT的弹窗
 * @param IItem Car NFT
 * @param cleanUpAfterSuccess 购买成功后调用的函数
 * @returns
 */
export default function ModalLevelUp({
  item,
  user,
  cleanUpAfterSuccess,
}: {
  item: IItem;
  user: TokenPayload;
  cleanUpAfterSuccess?: () => void;
}) {
  const { setModal } = useModal();
  const { call } = useDC();
  const { setLoading } = useLoading();
  const levelUp = async () => {
    setLoading({ visible: true, message: "Leveling up..." });

    const resp = await call({
      method: "post",
      path: "/nft/level_up_car",
      data: {
        id: item.nid,
      },
    });

    console.log("resp", resp);
    setLoading({ visible: false });

    if (resp?.msg === "ok") {
      toast.success("Success!");
      cleanUpAfterSuccess();
      setModal({ visible: false });
    }
  };
  return (
    <div className="relative w-full p-8 flex flex-col justify-center items-center">
      <div className="relative text-xl sm:text-2xl font-bold text-gray-900 ">Level up</div>

      <div className="mt-2 mx-auto w-8/12 flex justify-between space-x-4">
        <span className="text-base sm:text-lg text-gray-400 font-semibold">Current level</span>
        <span className="text-base sm:text-lg text-gray-900 font-semibold">{item.level}</span>
      </div>
      <div className="mt-2 mx-auto w-8/12 flex justify-between space-x-4">
        <span className="text-base sm:text-lg text-gray-400 font-semibold">Cost</span>
        <span className="text-base sm:text-lg text-gray-900 font-semibold">
          {Math.round(calcLevelUpCost(item.level) * 100) / 100} DCT
        </span>
      </div>

      <div className="mt-4 w-full flex justify-center items-center space-x-4">
        <Button
          type="button"
          style="min-h-0 h-10 bg-opacity-0 hover:bg-opacity-10 focus:bg-opacity-20"
          onClick={() => setModal({ visible: false })}
        >
          CANCEL
        </Button>
        <Button type="button" style="min-h-0 h-10" onClick={levelUp}>
          CONFIRM
        </Button>
      </div>
    </div>
  );
}
