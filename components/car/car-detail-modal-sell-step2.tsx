import Button from "@components/common/button";
import Input from "@components/common/input";
import { useModal } from "@components/common/modal-provider";
import { IItem } from "@model/model";
import Image from "next/image";
import { useForm } from "react-hook-form";
import NP from "number-precision";
import ModalSellStep3 from "./car-detail-modal-sell-step3";

interface IFormValue {
  sellingPrice: number;
}

/**
 * 升级Car NFT的弹窗
 * @param IItem Car NFT
 * @returns
 */
export default function ModalSellStep2({ item }: { item: IItem }) {
  const { setModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValue>();
  const onSubmit = (data: IFormValue) => {
    setModal({
      visible: true,
      title: "Confirm To Sell",
      children: <ModalSellStep3 item={item} sellingPrice={data.sellingPrice.toString()} />,
    });
  };
  const { onChange, onBlur, name, ref } = register("sellingPrice", {
    required: "* The selling price is required",
    validate: (value) => {
      if (value < 0.01) {
        return "* The selling price should be greater than 0.01";
      }
      return true;
    },
  });
  return (
    <form className="relative w-full p-4 flex flex-col justify-center items-center" onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-60 h-40">
        {item?.pic && <Image src={item?.pic} layout="fill" objectFit="fill" alt="" />}
      </div>
      <div className="relative w-full flex flex-col">
        <div className="w-full text-sm sm:text-lg font-bold text-gray-400">Selling price</div>
        <div className="flex items-center">
          <Input
            id="sellingPrice"
            type="number"
            onChange={onChange}
            onBlur={onBlur}
            name={name}
            inputRef={ref}
            style="h-12 px-4"
          />
          <div className="absolute right-4 font-semibold">SOL</div>
        </div>

        <div className="w-full text-sm text-red-500 min-h-6">{errors.sellingPrice?.message}</div>
      </div>

      <div className="mt-4 w-full flex justify-center items-center space-x-4">
        <Button
          type="button"
          style="min-h-0 h-10 bg-opacity-0 hover:bg-opacity-10 focus:bg-opacity-20"
          onClick={() => setModal({ visible: false })}
        >
          CANCEL
        </Button>
        <Button type="submit" style="min-h-0 h-10">
          NEXT
        </Button>
      </div>
    </form>
  );
}
