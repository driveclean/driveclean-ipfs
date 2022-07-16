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
export default function ModalMintSelect({
  carList,
  setSelectedCar,
}: {
  carList: IItem[];
  setSelectedCar: Dispatch<SetStateAction<IItem>>;
}) {
  const { setModal } = useModal();
  const [selectedVehicle, setSelectedVehicle] = useState<SelectOptionProps>({
    id: "0",
    name: "Please select a car nft",
  });
  return (
    <div className="relative p-4 flex flex-col justify-center items-center">
      <Select
        id="mint-select"
        options={carList.map((car) => {
          return { id: car.nid, name: `#${car.nid}` };
        })}
        selected={selectedVehicle}
        setSelected={setSelectedVehicle}
      />
      {selectedVehicle.id !== "0" && (
        <div className="w-full flex justify-center items-center">
          <div className="relative w-[60vw] h-[40vw]">
            <Image
              src={
                carList.find((car) => {
                  return car.nid === selectedVehicle.id;
                })?.pic
              }
              layout="fill"
              objectFit="fill"
              alt=""
            />
          </div>
        </div>
      )}
      <div className="mt-8 w-full flex justify-center items-center space-x-4">
        <Button
          type="button"
          style="min-h-0 h-10"
          disabled={selectedVehicle.id === "0"}
          onClick={() => {
            setSelectedCar(
              carList.find((car) => {
                return car.nid === selectedVehicle.id;
              })
            );
            setModal({ visible: false });
          }}
        >
          SELECT
        </Button>
      </div>
    </div>
  );
}
