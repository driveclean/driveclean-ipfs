import Button from "@components/common/button";
import Input from "@components/common/input";
import { useModal } from "@components/common/modal-provider";
import useDC from "@lib/dc/dc";
import { useLayout } from "@lib/hooks";
import { WithdrawBalanceReq } from "pages/api/balance/withdraw";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import NP from "number-precision";

interface WithdrawFromProps {
  amount: number;
}

const WithdrawModal = ({
  balance,
  amount,
  callback,
}: {
  balance: string;
  amount: number;
  callback: () => Promise<void>;
}) => {
  const { setModal } = useModal();
  const { call } = useDC();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();
  const onSubmit = async () => {
    const resp = await call<WithdrawBalanceReq>({
      method: "post",
      path: "/balance/withdraw",
      data: { amount: amount.toString() },
    });
    if (resp && resp.msg === "ok") {
      await callback();
      toast.success("Withdraw success!");
      setModal({ visible: false });
    }
  };
  return (
    <form className="relative w-72 flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-full">
        <div>Balance After Withdraw</div>
        <div className="px-4 w-full h-12 flex justify-between items-center text-sm sm:text-base font-semibold text-gray-900 rounded-md border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900 focus:shadow-[2px_2px] focus:shadow-gray-900 focus:border-gray-900">
          <div>DCT</div>
          <div>{NP.minus(balance, amount)}</div>
        </div>
      </div>
      <div className="relative w-full">
        <div>Withdraw Amount</div>
        <div className="px-4 w-full h-12 flex justify-between items-center text-sm sm:text-base font-semibold text-gray-900 rounded-md border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900 focus:shadow-[2px_2px] focus:shadow-gray-900 focus:border-gray-900">
          <div>DCT</div>
          <div>{amount}</div>
        </div>
        <div className="w-full mt-4 flex justify-center">
          <Button type="submit" style="min-h-0 h-10" isLoading={isSubmitting}>
            Confirm
          </Button>
        </div>
      </div>
    </form>
  );
};

/**
 * 钱包页面
 * @returns 钱包页面
 */
export default function Wallet() {
  useLayout({ isNeedBack: true, isNeedWallet: false, title: "Wallet" });
  const { visible, setModal } = useModal();
  const { call } = useDC();
  const [balance, setBalance] = useState("-");

  // 获取余额
  const getBalance = useCallback(async () => {
    const resp = await call({ method: "get", path: "/balance/get" });
    if (resp && resp.balance) {
      setBalance(resp.balance);
    }
  }, [call]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawFromProps>();
  const onSubmit = async (data: WithdrawFromProps) => {
    setModal({
      visible: true,
      title: "Withdraw",
      children: (
        <WithdrawModal
          balance={balance}
          amount={data.amount}
          callback={async () => {
            reset();
            await getBalance();
          }}
        />
      ),
    });
  };
  const { onChange, onBlur, name, ref } = register("amount", {
    required: "* The amount of withdraw is required",
    validate: (value) => {
      if (value < 0.01) {
        return "* The amount of withdraw should be greater than 0.01";
      }
      if (value > NP.strip(balance)) {
        return "* The amount of withdraw should not be greater than your balance";
      }
      return true;
    },
  });

  useEffect(() => {
    getBalance();
  }, [getBalance]);
  return (
    <form className="relative h-full flex-1 flex flex-col p-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="relative flex-1">
        <div className="w-full text-lg sm:text-xl font-bold text-gray-900">Balance</div>
        <div className="mt-2 px-4 w-full h-12 flex justify-between items-center text-base sm:text-lg font-semibold text-gray-900 rounded-md border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900 focus:shadow-[2px_2px] focus:shadow-gray-900 focus:border-gray-900">
          <div>DCT</div>
          <div>{balance}</div>
        </div>
        <div className="relative mt-8 w-full">
          <div className="w-full text-lg sm:text-xl font-bold text-gray-900">Withdraw Amount</div>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            onChange={onChange}
            onBlur={onBlur}
            name={name}
            inputRef={ref}
            style="h-12 text-right px-4 placeholder:text-right"
          />
          <div className="w-full mt-2 text-sm text-red-500 min-h-6">{errors.amount?.message}</div>
        </div>
      </div>

      <div className="relative flex justify-center items-center">
        <Button type="submit">Withdraw</Button>
      </div>
    </form>
  );
}
