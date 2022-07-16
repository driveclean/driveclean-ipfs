import { useLoading } from "@components/common/loading-provider";
import useDC from "@lib/dc/dc";
import { useLayout, useParam } from "@lib/hooks";
import { selectUser } from "app/reducers/user";
import { useRouter } from "next/router";
import { ResDataForGetAllCarNFT } from "pages/api/nft/get_all_car_nft";
import { createContext, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import cn from "classnames";
import { ResDataForGetCarNFTDetails } from "pages/api/nft/get_car_nft_details";
import { dcNFTCarToItem } from "@lib/utils";
import { IItem } from "@model/model";
import { useModal } from "@components/common/modal-provider";
import ModalLevelUp from "./car-modal-level-up";
import classNames from "classnames";
import ModalSellStep1 from "./car-detail-modal-sell-step1";
import Button from "@components/common/button";
import { Player } from "@lottiefiles/react-lottie-player";
import ModalMintSelect from "./car-mint-modal-mint-select";
import { dc_nft_cars } from "@prisma/client";
import { useForm } from "react-hook-form";
import ModalMintSuccess from "./car-mint-modal-mint-success";

/**
 * 换算repair所需的DCT
 * TODO: 变成api
 *
 * @param {amount} repair后增加的磨损值
 * @returns 所需的DCT
 */

export const convertRepairAmountToDCT = (amount: number) => {
  return amount / 100.0;
};

/**
 * Car NFT详情页
 * @returns Car NFT详情页
 */
export default function CarMint() {
  useLayout({
    isNeedBack: true,
    isNeedWallet: false,
    headerStyle: "bg-green-100 animate-in slide-in-from-left-16 duration-500",
    title: "Car Mint",
  });
  const car_id = useParam("carid"); // 通过当前url中carid参数的值，获取nft car id

  const [baseCar, setBaseCar] = useState<IItem>();
  const [selectedCar, setSelectedCar] = useState<IItem>();
  const { call } = useDC();
  const { setLoading } = useLoading();
  const { setModal } = useModal();
  const updateCarInfo = useCallback(async () => {
    setLoading({ visible: true, message: "Getting info..." });

    const resp: ResDataForGetCarNFTDetails = await call({
      method: "get",
      path: "/nft/get_car_nft_details",
      params: {
        id: car_id,
      },
    });
    setLoading({ visible: false });

    const carSelected: IItem = dcNFTCarToItem(resp?.data);
    setBaseCar(carSelected);
  }, [call, car_id, setLoading]);

  const onClickSelect = useCallback(async () => {
    setLoading({ visible: true, message: "Getting info..." });

    const resp: ResDataForGetAllCarNFT = await call({
      method: "get",
      path: "/nft/get_all_car_nft",
    });

    const carList: IItem[] = resp?.data
      ?.map((car: dc_nft_cars) => dcNFTCarToItem(car))
      .filter((car) => car.nid !== baseCar.nid);

    setModal({
      visible: true,
      title: "Select a car nft",
      children: <ModalMintSelect carList={carList} setSelectedCar={setSelectedCar} />,
    });
    setLoading({ visible: false });
  }, [baseCar, call, setLoading, setModal]);

  useEffect(() => {
    if (car_id) {
      updateCarInfo();
    }
  }, [car_id, updateCarInfo]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();
  const onSubmit = useCallback(async () => {
    const resp = await call<any, dc_nft_cars>({
      method: "post",
      path: "/nft/mint",
      data: {
        base_id: baseCar.nid,
        selected_id: selectedCar.nid,
      },
    });
    const newCar = dcNFTCarToItem(resp);
    setModal({ visible: true, title: "Mint Success", children: <ModalMintSuccess newCar={newCar} /> });
  }, [baseCar, call, selectedCar, setModal]);

  return (
    <form
      className="relative w-full h-full flex flex-col flex-1 animate-in slide-in-from-top-16 duration-500"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="relative w-full flex-1">
        <div className="relative rounded-b-3xl bg-green-100 flex space-y-4 flex-col px-8 pb-8">
          <div className="relative pb-8 w-full border-2 border-gray-900 rounded-xl shadow-[2px_2px] shadow-gray-900 flex flex-col items-center overflow-hidden text-gray-900 bg-gray-100">
            <div className="w-full flex justify-center items-center">
              <div className="relative w-[60vw] h-[40vw]">
                {baseCar?.pic && <Image src={baseCar?.pic} layout="fill" objectFit="fill" alt="" />}
              </div>
            </div>

            <div className="w-5/12 border-2 border-gray-900 rounded-full p-1 flex text-xs sm:text-sm">
              <span className="w-4 sm:w-5 h-4 sm:h-5 bg-gray-900 rounded-full text-white flex justify-center items-center flex-shrink-0">
                #
              </span>
              <span className="w-full flex justify-center items-center">{baseCar?.nid.padStart(8, "0")}</span>
            </div>
          </div>
          <Player src="/icons/link.json" style={{ width: "4rem", height: "4rem" }} autoplay loop></Player>
          <div className="relative w-full pb-8 border-2 border-gray-900 rounded-xl shadow-[2px_2px] shadow-gray-900 flex flex-col items-center overflow-hidden text-gray-900 bg-gray-100">
            {selectedCar ? (
              <div className="w-full flex justify-center items-center">
                <div className="relative w-[60vw] h-[40vw]">
                  {baseCar?.pic && <Image src={selectedCar?.pic} layout="fill" objectFit="fill" alt="" />}
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center items-center" onClick={onClickSelect}>
                <div className="relative w-[60vw] h-[40vw] flex justify-center items-center">
                  <Player
                    src="/icons/add.json"
                    style={{ width: "3.5rem", height: "3.5rem" }}
                    autoplay={true}
                    hover
                  ></Player>
                </div>
              </div>
            )}
            <div className="w-5/12 border-2 border-gray-900 rounded-full p-1 flex text-xs sm:text-sm">
              <span className="w-4 sm:w-5 h-4 sm:h-5 bg-gray-900 rounded-full text-white flex justify-center items-center flex-shrink-0">
                #
              </span>
              <span className="w-full flex justify-center items-center">{selectedCar?.nid.padStart(8, "0")}</span>
            </div>
          </div>
        </div>
        <div className="relative mt-8 px-8 pb-8">
          <div className="relative w-full px-4 sm:px-8 py-4 border-2 border-gray-900 rounded-xl shadow-[2px_2px] shadow-gray-900 flex justify-between items-center overflow-hidden text-gray-900 bg-gray-100">
            <span className="text-sm sm:text-lg text-gray-400">Token consumption</span>
            <span className="text-sm sm:text-lg font-bold text-gray-900">{selectedCar ? 300 : 0} DCT + 0 CGT</span>
          </div>
        </div>
      </div>

      {/* 底部命令 */}
      <div
        className={classNames([
          "sticky bottom-0 w-full px-8 flex justify-center items-center",
          "pb-[max(1rem,constant(safe-area-inset-bottom))]",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        ])}
      >
        <Button
          type="submit"
          style="w-1/2 text-xl"
          disabled={typeof selectedCar === "undefined" ? true : false}
          isLoading={isSubmitting}
        >
          Mint
        </Button>
      </div>
    </form>
  );
}
