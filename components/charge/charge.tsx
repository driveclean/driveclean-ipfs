import Button from "@components/common/button";
import { useLoading } from "@components/common/loading-provider";
import { BASE_PATH } from "@constants/constants";
import { CHARGING_STATE_CHARGING, CHARGING_STATE_COMPLETE } from "@constants/tesla";
import { ChargeGetResp } from "@lib/api/charge/charge";
import useDC from "@lib/dc/dc";
import { Player } from "@lottiefiles/react-lottie-player";
import { useAppDispatch } from "app/hooks";
import { updateLayout } from "app/reducers/layout";
import classNames from "classnames";
import { useRouter } from "next/router";
import { StopChargeReq } from "pages/api/charge/stop";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export const emptyChargeGetResp = {
  charge_id: "0",
  charge_status: 1,
  max_kwh: "0",
  remaining_kwh: "0",
  total_kwh: "0",
  total_amount: "0",
  last_kwh: "0",
  last_amount: "0",
} as ChargeGetResp;

/**
 * 充电页面
 * @returns 充电页面
 */
export default function Charge() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { setLoading } = useLoading();
  const { call } = useDC();
  const [isPulse, setIsPulse] = useState(false);

  const [chargeState, setChargeState] = useState<ChargeGetResp>(emptyChargeGetResp);

  const timer = useRef<NodeJS.Timeout>();
  const getChargeState = useCallback(async () => {
    const chargeGetResp = (await call({
      method: "get",
      path: "/charge/get",
      params: chargeState.charge_id !== "0" ? { charge_id: chargeState.charge_id } : undefined,
    })) as ChargeGetResp;
    if (chargeGetResp) {
      setIsPulse(true);
      setTimeout(() => {
        setIsPulse(false);
      }, 4000);
      setChargeState(chargeGetResp);
      if (chargeGetResp.charge_state === CHARGING_STATE_COMPLETE) {
        dispatch(
          updateLayout({
            title: CHARGING_STATE_COMPLETE,
            headerStyle: "bg-green-200 animate-in fade-in duration-500",
            isNeedBack: true,
            isNeedWallet: false,
          })
        );
        clearInterval(timer.current);
      } else {
        dispatch(
          updateLayout({
            title: CHARGING_STATE_CHARGING,
            headerStyle: "bg-green-200 animate-in fade-in duration-500",
            isNeedBack: true,
            isNeedWallet: false,
          })
        );
      }
    }
  }, [call, chargeState.charge_id, dispatch]);
  useEffect(() => {
    dispatch(
      updateLayout({
        title: "Loading",
        headerStyle: "bg-green-200 animate-in fade-in duration-500",
        isNeedBack: true,
        isNeedWallet: false,
      })
    );
    if (!timer.current) {
      setLoading({ visible: true });
    }
    const f = async () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
      timer.current = setInterval(getChargeState, 10000);
      await getChargeState();
      setLoading({ visible: false });
    };
    f();
  }, [dispatch, getChargeState, setLoading]);

  const {
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm();
  const onSubmitStop = async () => {
    const resp = await call<StopChargeReq>({
      method: "post",
      path: "/charge/stop",
      data: { charge_id: chargeState?.charge_id },
    });
    if (resp) {
      toast.success("Charge completed, going back to home page...");
      setTimeout(() => {
        router.push({ pathname: BASE_PATH, query: { p: "space" } });
      }, 3000);
    }
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col bg-green-400 animate-in fade-in duration-500">
      <div className="relative px-8 py-4 w-full bg-green-200 rounded-b-3xl flex justify-between text-sm sm:text-base font-semibold text-gray-900">
        <div>Earning DCT {chargeState.total_amount}</div>
        <div>
          Remaining kWh {chargeState.remaining_kwh}/{chargeState.max_kwh}
        </div>
      </div>
      <div className="relative w-full flex-1 flex flex-col justify-center items-center text-white">
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="relative w-full flex flex-col justify-center items-center">
            <div className="text-6xl sm:text-8xl font-black">{chargeState.total_kwh}</div>
            <div className="text-xl sm:text-2xl font-semibold">kWh</div>
          </div>

          <div
            className={classNames([
              "relative mt-4 w-full flex justify-center items-center space-x-2",
              isPulse && "animate-pulse",
            ])}
          >
            <Player src="/icons/coin.json" style={{ width: "3rem", height: "3rem" }} autoplay loop></Player>
            <div className="text-3xl sm:text-5xl font-bold text-[#FFBC58]">+{chargeState.total_amount}</div>
          </div>
        </div>
        <div>Not in clean charging station.</div>
        <div>No extra bonus.</div>
      </div>
      <form
        className="relative pt-4 py-8 w-full bg-green-100 rounded-t-3xl flex justify-center items-center"
        onSubmit={handleSubmit(onSubmitStop)}
      >
        {chargeState.charge_state === CHARGING_STATE_CHARGING && (
          <Button type="submit" style="min-h-0 h-10" isLoading={isSubmitting || isSubmitSuccessful}>
            Stop
          </Button>
        )}
        {chargeState.charge_state === CHARGING_STATE_COMPLETE && (
          <Button
            style="min-h-0 h-10"
            onClick={() => {
              router.push({ pathname: BASE_PATH, query: { p: "space" } });
            }}
          >
            Go back
          </Button>
        )}
      </form>
    </div>
  );
}
