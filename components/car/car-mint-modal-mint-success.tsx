import Button from "@components/common/button";
import { useLoading } from "@components/common/loading-provider";
import { useModal } from "@components/common/modal-provider";
import Select, { SelectOptionProps } from "@components/common/select";
import useDC from "@lib/dc/dc";
import { dcNFTCarToItem } from "@lib/utils";
import { IItem } from "@model/model";
import { dc_nft_cars } from "@prisma/client";
import Image from "next/image";
import { ResDataForGetAllCarNFT } from "pages/api/nft/get_all_car_nft";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ModalSellStep2 from "./car-detail-modal-sell-step2";
import ModalLevelUp from "./car-modal-level-up";

/**
 * 选择Car NFT用于mint的弹窗
 * @returns
 */
export default function ModalMintSuccess({ newCar }: { newCar: IItem }) {
  const { setModal } = useModal();
  return (
    <div className="relative p-4 flex flex-col justify-center items-center">
      {newCar.nid !== "0" && (
        <>
          <div className="w-full flex justify-center items-center">
            <div className="relative w-[60vw] h-[40vw]">
              <Image src={newCar?.pic} layout="fill" objectFit="fill" alt="" />
            </div>
          </div>
          <div className="w-full flex flex-col px-4 ">
            <div className="text-sm font-semibold">Attributes</div>
            <div className="mt-2 flex flex-col space-y-2 text-xs text-gray-500">
              <div className="pl-4 flex justify-between">
                <span>Powerhorse</span> <span>{newCar?.attribute_horsepower}</span>
              </div>
              <div className="pl-4 flex justify-between">
                <span>Resiliance</span> <span>{newCar?.attribute_durability}</span>
              </div>
              <div className="pl-4 flex justify-between">
                <span>Luckiness</span> <span>{newCar?.attribute_luckiness}</span>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="mt-8 w-full flex justify-center items-center space-x-4">
        <Button
          type="button"
          style="min-h-0 h-10"
          onClick={() => {
            setModal({ visible: false });
          }}
        >
          COLLECT
        </Button>
      </div>
    </div>
  );
}
