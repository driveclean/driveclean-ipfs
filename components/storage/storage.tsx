import Layout from "@components/common/layout";
import { useLoading } from "@components/common/loading-provider";
import Item from "@components/item/item";
import ItemTypeTab from "@components/item/item-type-tab";
import useDC from "@lib/dc/dc";
import { useLayout } from "@lib/hooks";
import { dcNFTCarToItem } from "@lib/utils";
import { IItem } from "@model/model";
import { dc_nft_cars } from "@prisma/client";
import { ResDataForGetAllCarNFT } from "pages/api/nft/get_all_car_nft";
import { useCallback, useEffect, useState } from "react";

const fakeCarList = [
  { nid: "1", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "11.17" },
  { nid: "2", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "18.69" },
  { nid: "3", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "6.32" },
  { nid: "4", type: "car", pic: "/icons/tesla-model-x.svg", mint: 2, level: 5, price: "8.83" },
];

const fakePartList = [
  { nid: "1", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "11.17" },
  { nid: "2", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "18.69" },
  { nid: "3", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "6.32" },
  { nid: "4", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "8.83" },
];

/**
 * 个人收藏页面
 * @returns 个人收藏页面
 */
export default function Storage() {
  useLayout();
  const [type, setType] = useState("cars");
  const { call } = useDC();
  const { setLoading } = useLoading();
  const [carList, setCarList] = useState<IItem[]>([]);

  const updateCarInfo = useCallback(async () => {
    setLoading({ visible: true, message: "Getting info..." });

    const resp: ResDataForGetAllCarNFT = await call({
      method: "get",
      path: "/nft/get_all_car_nft",
    });
    setLoading({ visible: false });

    // convert nft cars to IUser
    const listedCars: IItem[] = resp?.data?.map((car: dc_nft_cars) => dcNFTCarToItem(car));

    setCarList(listedCars);
  }, [call, setLoading]);

  useEffect(() => {
    updateCarInfo();
  }, [updateCarInfo]);

  return (
    <div className="relative w-full px-8 animate-in fade-in duration-500">
      <ItemTypeTab type={type} setType={setType} />
      {type === "cars" && (
        <div className="relative w-full pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 font-medium animate-in fade-in duration-500">
          {carList?.map((item) => item && <Item key={item.nid} item={item} location="storage" />)}
        </div>
      )}
      {type === "parts" && (
        <div className="relative w-full pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 font-medium animate-in fade-in duration-500">
          {fakePartList.map((item) => (
            <Item key={item.nid} item={item as IItem} location="storage" />
          ))}
        </div>
      )}
    </div>
  );
}
