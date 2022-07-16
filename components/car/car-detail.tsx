import { useLoading } from "@components/common/loading-provider";
import useDC from "@lib/dc/dc";
import { useLayout, useParam } from "@lib/hooks";
import { selectUser } from "app/reducers/user";
import { useRouter } from "next/router";
import { ResDataForGetAllCarNFT } from "pages/api/nft/get_all_car_nft";
import { useCallback, useEffect, useState } from "react";
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
export default function CarDetail() {
  useLayout({
    isNeedBack: true,
    isNeedWallet: true,
    headerStyle: "bg-green-100 animate-in slide-in-from-left-16 duration-500",
  });
  const car_id = useParam("carid"); // 通过当前url中carid参数的值，获取nft car id

  const [carSelectedDetails, setCarSelectedDetails] = useState<IItem>();
  const user = useSelector(selectUser);
  const router = useRouter();
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
    setCarSelectedDetails(carSelected);

    console.log(resp);
  }, [call, car_id, setLoading]);

  const onClickLevelUpButton = async () => {
    setModal({
      visible: true,
      children: <ModalLevelUp item={carSelectedDetails} user={user} cleanUpAfterSuccess={updateCarInfo} />,
    });
    // alert(resp.msg);
  };

  const onClickRepairButton = async (repair_amount) => {
    setLoading({ visible: true, message: "Repairing..." });

    // convertRepairAmountToDCT(repair_amount);

    const resp = await call({
      method: "post",
      path: "/nft/repair_car",
      data: {
        id: car_id,
        repair_amount: 10,
      },
    });
    setLoading({ visible: false });
    updateCarInfo();
  };

  const onClickMintButton = useCallback(() => {
    router.push({ pathname: "/alpha", query: { p: "car_mint", carid: car_id } });
  }, [car_id, router]);

  const onClickSellButton = () => {
    setModal({ visible: true, title: "Sell", children: <ModalSellStep1 item={carSelectedDetails} /> });
  };
  useEffect(() => {
    if (car_id) {
      updateCarInfo();
    }
  }, [car_id, updateCarInfo]);

  return (
    <div className="relative w-full h-full flex flex-col flex-1 animate-in slide-in-from-top-16 duration-500">
      <div className="relative w-full flex-1">
        <div className="relative rounded-b-3xl bg-green-100 flex items-left space-y-4 flex-col px-8 pb-8">
          <div className="col-span-1 w-full border-2 border-gray-900 rounded-xl shadow-[2px_2px] shadow-gray-900 flex flex-col items-center overflow-hidden text-gray-900 bg-gray-100">
            {/* NFT主图 */}
            <div className="w-full mt-6 ob flex justify-center items-center">
              <div className="relative w-[60vw] h-[40vw]">
                {carSelectedDetails?.pic && (
                  <Image src={carSelectedDetails?.pic} layout="fill" objectFit="fill" alt="" />
                )}
              </div>
            </div>

            {/* 核心信息 */}
            <div className="w-5/12 border-2 border-gray-900 rounded-full p-1 flex text-xs sm:text-sm">
              <span className="w-4 sm:w-5 h-4 sm:h-5 bg-gray-900 rounded-full text-white flex justify-center items-center flex-shrink-0">
                #
              </span>
              <span className="w-full flex justify-center items-center">
                {carSelectedDetails?.nid.padStart(8, "0")}
              </span>
            </div>

            <div className="mt-6 w-full px-4 flex space-x-4 justify-between items-center">
              <div className="w-1/2 border-2 border-gray-600 bg-gray-300 rounded-full py-1 px-2 flex text-xs italic sm:text-sm">
                {/* TODO: 建立type简称的对应关系func */}
                <span className="w-full flex justify-center items-center">
                  {carSelectedDetails?.type?.split(" ")[0]}
                </span>
              </div>
              <div className="w-1/2 border-2 border-gray-600 bg-gray-300 rounded-full py-1 px-2 flex text-xs italic sm:text-sm">
                <span className="w-full flex justify-center items-center">{carSelectedDetails?.rarity}</span>
              </div>
            </div>
            <div className="mt-4 w-full px-4 flex space-x-4 justify-between items-center">
              <div className="w-1/2 border-2 border-gray-600/50 bg-gray-200 rounded-full py-1 px-2 flex text-xs italic sm:text-sm">
                <span className="w-full flex justify-center items-center">{`Mint ${carSelectedDetails?.mint}`}</span>
              </div>
              <div className="w-1/2 border-2 border-gray-600/50 bg-gray-200 rounded-full py-1 px-2 flex text-xs italic sm:text-sm">
                <span className="w-full flex justify-center items-center">{`Lv ${carSelectedDetails?.level}`}</span>
              </div>
            </div>

            <div className="w-full mt-6 px-4 py-1 flex flex-col space-y-6 justify-between items-left text-xs sm:text-sm">
              <div>
                <div>NFT Life</div>
                <div className="w-full bg-gray-200 rounded-full h-4 flex items-center">
                  <div
                    className="bg-green-300 h-4 rounded-full"
                    style={{ width: (1 / carSelectedDetails?.lifespan) * 100 + "%" }}
                  ></div>
                  <span className="mx-auto">{`1 / ${carSelectedDetails?.lifespan} month`}</span>
                </div>
              </div>
              <div>
                <div>Durability</div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-300 h-4 rounded-full flex justify-center items-center"
                    style={{ width: carSelectedDetails?.depreciation + "%" }}
                  >
                    {`${carSelectedDetails?.depreciation}/100`}
                  </div>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="mt-6 pb-10 w-full flex flex-col px-4 ">
              <div className="text-sm italic font-semibold">Attributes</div>
              <div className="mt-2 flex flex-col space-y-2 text-xs text-gray-500">
                <div className="pl-4 flex justify-between">
                  <span>Powerhorse</span> <span>{carSelectedDetails?.attribute_horsepower}</span>
                </div>
                <div className="pl-4 flex justify-between">
                  <span>Resiliance</span> <span>{carSelectedDetails?.attribute_durability}</span>
                </div>
                <div className="pl-4 flex justify-between">
                  <span>Luckiness</span> <span>{carSelectedDetails?.attribute_luckiness}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部命令 */}
      <div
        className={classNames([
          "sticky bottom-0 w-full px-8 pt-4",
          "pb-[max(1rem,constant(safe-area-inset-bottom))]",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        ])}
      >
        <div
          className={cn(["bg-gray-100 border-green-300 border-4 rounded-full shadow-[0px_0vh_2vh_rgba(0,0,0,0.1)]"])}
        >
          <div className="p-4 flex justify-around text-xs">
            <button
              type="button"
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
              onClick={onClickLevelUpButton}
            >
              Lv up
            </button>
            <button
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
              onClick={onClickRepairButton}
            >
              Repair
            </button>
            <button
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
              onClick={onClickMintButton}
            >
              Mint
            </button>
            <button
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
              onClick={onClickSellButton}
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
