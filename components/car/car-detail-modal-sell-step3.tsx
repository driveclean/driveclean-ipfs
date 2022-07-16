import Button from "@components/common/button";
import Input from "@components/common/input";
import { useModal } from "@components/common/modal-provider";
import { IItem } from "@model/model";
import Image from "next/image";
import { useForm } from "react-hook-form";
import NP from "number-precision";
import useDC from "@lib/dc/dc";
import { toast } from "react-toastify";

/**
 * 升级Car NFT的弹窗
 * @param IItem Car NFT
 * @returns
 */
export default function ModalSellStep3({ item, sellingPrice }: { item: IItem; sellingPrice: string }) {
  const { setModal } = useModal();
  const { call } = useDC();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();
  const onSubmit = async () => {
    const resp = await call({
      method: "post",
      path: "/nft/sell",
      data: {
        id: item.nid,
        selling_price: sellingPrice,
      },
    });
    if (resp) {
      toast.success("Listing Success!");
      setModal({ visible: false });
    }
  };
  return (
    <form className="relative w-full p-4 flex flex-col justify-center items-center" onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-full flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-400">List Price</span>
          <span className="font-semibold text-gray-900">{sellingPrice} SOL</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-400">Artist Royalties</span>
          <span className="font-semibold text-gray-900">{item.royalties}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-400">Transaction Fee</span>
          <span className="font-semibold text-gray-900">4%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-400">Listing/Cancel</span>
          <span className="font-semibold text-gray-900">Free</span>
        </div>
      </div>
      <div className="mt-4 w-full flex justify-center items-center space-x-4">
        <Button
          type="button"
          style="min-h-0 h-10 bg-opacity-0 hover:bg-opacity-10 focus:bg-opacity-20"
          onClick={() => setModal({ visible: false })}
        >
          CANCEL
        </Button>
        <Button type="submit" style="min-h-0 h-10" isLoading={isSubmitting}>
          CONFIRM
        </Button>
      </div>
    </form>
  );
}
