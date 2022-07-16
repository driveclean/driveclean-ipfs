import Button from "@components/common/button";
import Select, { SelectOptionProps } from "@components/common/select";
import Input from "@components/common/input";
import { useLoading } from "@components/common/loading-provider";
import { useModal } from "@components/common/modal-provider";
import useDC from "@lib/dc/dc";
import { useLayout } from "@lib/hooks";
import logger from "@lib/logger";
import { useAppSelector } from "app/hooks";
import { selectUser } from "app/reducers/user";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BASE_PATH } from "@constants/constants";
import router from "next/router";
import { dc_nft_cars } from "@prisma/client";
import { IItem } from "@model/model";
import { dcNFTCarToItem } from "@lib/utils";
import { Player } from "@lottiefiles/react-lottie-player";
import { CHARGING_STATE_CHARGING } from "@constants/tesla";
import { SpaceGetResp } from "pages/api/space/get";
import _ from "lodash";
import np from "number-precision";
import Link from "next/link";
interface TokenFormProps {
  teslaRefreshToken: string;
  vehicleId: SelectOptionProps;
}

const TokenForm = () => {
  const { call } = useDC();
  const { setModal } = useModal();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<TokenFormProps>();
  const {
    onChange: onChangeTeslaRefreshToken,
    onBlur: onBlurTeslaRefreshToken,
    name: nameTeslaRefreshToken,
    ref: refTeslaRefreshToken,
  } = register("teslaRefreshToken", { required: "* Refresh token is required" });
  const [vehicleList, setVehicleList] = useState<Array<SelectOptionProps>>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<SelectOptionProps>({
    id: "0",
    name: "Please input refresh token",
  });
  const onSubmit = async (data: TokenFormProps) => {
    console.log(data);
    await call({
      method: "post",
      path: "/update_user",
      data: { tesla_refresh_token: data.teslaRefreshToken, vehicle_id: data.vehicleId.id },
    });
    setModal({ visible: false });
  };
  return (
    <form
      className="relative py-2 flex flex-col justify-center items-center text-gray-900 w-72"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="relative w-full text-sm sm:text-base font-semibold">Upload your refresh token</div>
      <Link href="https://www.teslafi.com/tokenUser.php" passHref>
        <div className="relative w-full text-xs text-blue-500">Instructions</div>
      </Link>

      <Input
        id="teslaRefreshToken"
        onChange={onChangeTeslaRefreshToken}
        onBlur={async (e) => {
          onBlurTeslaRefreshToken(e);
          if (e.target.value) {
            const resp = await call({
              method: "post",
              path: "/call_tesla",
              data: {
                method: "get",
                path: "/vehicles",
                data: { tesla_refresh_token: e.target.value },
              },
            });
            if (resp.error) {
              logger.error(`[/alpha?p=space] call /call_tesla with error: ${resp.error}`);
              return;
            }
            console.log(resp);
            (resp.response as Array<any>).forEach((vehicle) => {
              const newVehicleList = new Array<SelectOptionProps>();
              newVehicleList.push({ id: vehicle.id_s, name: vehicle.display_name });
              setVehicleList(newVehicleList);
              if (newVehicleList.length > 0) {
                clearErrors();
                setValue("vehicleId", newVehicleList[0]);
                setSelectedVehicle(newVehicleList[0]);
              } else {
                setSelectedVehicle({ id: "0", name: "No vehicle found" });
              }
            });
          }
        }}
        name={nameTeslaRefreshToken}
        inputRef={refTeslaRefreshToken}
      />
      <div className="relative w-full text-sm text-red-500 min-h-6">{errors.teslaRefreshToken?.message}</div>
      <div className="relative w-full text-sm sm:text-base font-semibold">Choose your vehicle</div>
      <Controller
        control={control}
        name="vehicleId"
        rules={{ required: "* Vehicle is required" }}
        render={({ field: { onChange } }) => (
          <Select
            id="vehicleId"
            options={vehicleList}
            selected={selectedVehicle}
            setSelected={setSelectedVehicle}
            onChange={onChange}
          />
        )}
      ></Controller>

      <div className="relative w-full text-sm text-red-500 min-h-6">
        {errors.vehicleId && (errors.vehicleId as any).message}
      </div>
      <div>
        <Button type="submit" style="min-h-0 h-8 sm:h-10" isLoading={isSubmitting}>
          Upload
        </Button>
      </div>
    </form>
  );
};

/**
 * 个人空间
 * @returns 个人空间
 */
export default function Space() {
  useLayout({ headerStyle: "bg-green-100 animate-in fade-in duration-500" });
  const { setLoading } = useLoading();
  const { call } = useDC();
  const user = useAppSelector(selectUser);
  const { setModal } = useModal();
  const [carList, setCarList] = useState<IItem[]>([]);
  const [carIDSelected, setCarIDSelected] = useState<number>();
  const addIconRef = useRef(null);
  const [spaceGetResp, setSpaceGetResp] = useState<SpaceGetResp>();

  // 点击充电按钮后的事件
  const onClickStartChargeButton = useCallback(async () => {
    setLoading({ visible: true });
    if (user && (!user.is_set_tesla_refresh_token || !user.vehicle_id)) {
      setModal({
        visible: true,
        title: "Upload your Tesla to start",
        children: <TokenForm />,
      });
      return;
    }
    const resp = await call({
      method: "post",
      path: "/charge/start",
      data: {
        car_nft_id: "1",
      },
    });
    if (resp) {
      router.push({ pathname: BASE_PATH, query: { p: "charge" } });
    }
    console.log(resp);
  }, [call, setLoading, setModal, user]);

  // TODO: 显示用户拥有的所有的car nft, 并可以滑动选择
  const init = useCallback(async () => {
    try {
      setLoading({ visible: true, message: "Getting info..." });

      const resp = await call<null, SpaceGetResp>({
        method: "get",
        path: "/space/get",
      });
      if (_.isEmpty(resp)) {
        return;
      }
      setSpaceGetResp(resp);

      // convert nft cars to IUser
      const listedCars: IItem[] = resp.car_nft_list?.map((car: dc_nft_cars) => dcNFTCarToItem(car)) || [];
      setCarList(listedCars);
    } finally {
      setLoading({ visible: false });
    }
  }, [call, setLoading]);

  useEffect(() => {
    init();
    if (user && (!user.is_set_tesla_refresh_token || !user.vehicle_id)) {
      setModal({
        visible: true,
        title: "Connect your Tesla",
        children: <TokenForm />,
      });
      return;
    }
  }, [setModal, init, user]);

  useEffect(() => {
    if (carList) {
      setCarIDSelected(Number(carList[0]?.nid));
    }
  }, [carList]);

  // 点击页面中间Car NFT大图之后的事件
  const onClickCarImage = () => {
    router.push({ pathname: BASE_PATH, query: { p: "car_detail", carid: carIDSelected } });
  };

  const getCentralImageUrl = () => {
    if (carList.length > 0) {
      return carList[0].pic;
    } else {
      return "";
    }
  };

  return (
    <div className="relative w-full animate-in fade-in duration-500">
      <div className="relative w-full p-8 bg-green-100 rounded-b-3xl">
        <div className="relative w-full h-48 sm:h-96 bg-white border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900 rounded-2xl sm:rounded-3xl flex justify-center items-center">
          {carList?.length > 0 ? (
            <div className="relative w-32 h-32 flex justify-center items-center">
              <Image src={carList[0].pic} layout="fill" objectFit="fill" alt="" onClick={onClickCarImage} />
            </div>
          ) : (
            <div
              onClick={() => {
                router.push({ pathname: BASE_PATH, query: { p: "shop" } });
              }}
            >
              <Player
                ref={addIconRef}
                src="/icons/add.json"
                style={{ width: "3.5rem", height: "3.5rem" }}
                autoplay={true}
                hover
              ></Player>
            </div>
          )}
        </div>
        {/* <div className="relative mt-4 flex space-x-4">
          {_.times(4, () => (
            <div className="inline-block relative w-1/4">
              <div className="mt-[100%]"></div>
              <div className="absolute top-0 bottom-0 left-0 right-0 border-2 rounded-2xl sm:rounded-3xl text-xs sm:text-sm text-gray-400 flex justify-center items-center break-words">
                Loot Box
              </div>
            </div>
          ))}
        </div> */}
      </div>

      <div className="relative w-full flex flex-col justify-center items-center px-8 py-4 space-y-4">
        <div className="relative w-full">
          <div className="relative text-sm sm:text-base text-gray-900 font-semibold">Power:</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-300 h-2.5 rounded-full"
              style={{
                width:
                  np
                    .divide(spaceGetResp?.charge?.remaining_kwh || 0, spaceGetResp?.charge?.max_kwh || 100, 1 / 100)
                    .toFixed(0) + "%",
              }}
            ></div>
          </div>
        </div>
        <div className="relative w-full">
          <div className="relative text-sm sm:text-base text-gray-900 font-semibold">Token:</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-300 h-2.5 rounded-full"
              style={{
                width:
                  np
                    .divide(
                      spaceGetResp?.user?.token_earned_weekly || 0,
                      spaceGetResp?.user?.max_token_weekly || 100,
                      1 / 100
                    )
                    .toFixed(0) + "%",
              }}
            ></div>
          </div>
        </div>

        <div className="relative flex flex-col justify-center items-center space-y-2">
          {spaceGetResp?.charge?.charge_state === CHARGING_STATE_CHARGING ? (
            <Button
              onClick={() => {
                router.push({ pathname: BASE_PATH, query: { p: "charge" } });
              }}
            >
              Continue
            </Button>
          ) : (
            <Button type="button" style="relative mt-8 h-10" onClick={onClickStartChargeButton}>
              <div className="relative w-20 h-8">
                <Image src="/icons/power.svg" layout="fill" objectFit="contain" alt="" />
              </div>
            </Button>
          )}
          <div className="text-xs sm:text-sm text-gray-900 font-semibold underline">How to play?</div>
        </div>
      </div>
    </div>
  );
}
