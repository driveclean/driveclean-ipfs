import Button from "@components/common/button";
import useDC from "@lib/dc/dc";
import { useParam } from "@lib/hooks";
import { BASE_PATH } from "constants/constants";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface FormValues {
  emailAddress: string;
  emailVerificationCode: string;
}

/**
 * 登录页面
 * @returns 登录页面
 */
export default function Login() {
  const { login } = useDC();
  // 以下注释为原始邮箱登录代码，暂时保留
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors, isSubmitting },
  // } = useForm<FormValues>();
  // const onSubmit = async (data) => {
  //   console.log(data);
  //   await new Promise((r) => setTimeout(r, 2000));
  //   router.replace({ pathname: BASE_PATH, query: { p: "space" } }, undefined, { shallow: true });
  // };
  // const emailAddress = register("emailAddress", { required: "* Email is required" });
  // const emailVerificationCode = register("emailVerificationCode", {
  //   required: "* Email verification code is required",
  //   maxLength: { value: 6, message: "* Invalid code" },
  //   minLength: { value: 6, message: "* Invalid code" },
  // });
  // const { count, startCounting } = useCountdown(EMAIL_VERIFY_CODE_KEY, EMAIL_VERIFY_CODE_EXPIRED_TIME);

  return (
    <div className="relative w-full h-full p-4 flex-1 flex flex-col items-center justify-center space-y-0 sm:space-y-2">
      <div className="sticky top-0 w-full p-4 flex justify-center">
        <div className="text-base sm:text-lg font-medium">LOGIN / SIGN UP</div>
      </div>
      <div className="relative w-full flex-1 flex justify-center items-center">
        <form
          className="relative w-full max-w-sm rounded-2xl flex flex-col justify-center items-center p-4 bg-white shadow-lg"
          // onSubmit={handleSubmit(onSubmit)} 原始邮箱登录代码，暂时保留
        >
          <div className="text-2xl sm:text-3xl text-gray-900 font-semibold">DriveClean Alpha</div>
          {/* 以下注释为原始邮箱登录代码，暂时保留 */}
          {/* <label htmlFor="emailAddress" className="sr-only">
          Email address
        </label>
        <Input
          id="emailAddress"
          type="email"
          style="mt-4"
          placeholder="Email address"
          onChange={emailAddress.onChange}
          onBlur={emailAddress.onBlur}
          name={emailAddress.name}
          inputRef={emailAddress.ref}
        />
        <div className="w-full text-sm text-red-500 min-h-[1.25rem]">{errors.emailAddress?.message}</div>

        <label htmlFor="emailVerificationCode" className="sr-only">
          Email verification code
        </label>
        <div className="relative mt-4 w-full flex flex-col justify-center">
          <Input
            id="emailVerificationCode"
            type="text"
            placeholder="Email verification code"
            maxLength={6}
            onChange={emailVerificationCode.onChange}
            onBlur={emailVerificationCode.onBlur}
            name={emailVerificationCode.name}
            inputRef={emailVerificationCode.ref}
          />
          <button
            type="button"
            className={classNames([
              "absolute right-0 mr-4 text-base sm:text-lg text-green-500 font-semibold",
              count && "pointer-events-none",
            ])}
            onClick={() => {
              startCounting();
            }}
          >
            {count ? `${count}s` : "Send Code"}
          </button>
        </div>
        <div className="w-full text-sm text-red-500 min-h-[1.25rem]">{errors.emailVerificationCode?.message}</div> */}

          <Button type="button" style="mt-2 w-full" onClick={() => login()}>
            Connect Wallet
          </Button>
          <div className="mt-4 text-xs text-gray-400 italic">Account will be automatically registered</div>
        </form>
      </div>

      <div className="sticky bottom-0 w-full p-4 flex justify-center text-xs sm:text-sm font-light">
        <span className="text-center">
          <span>Registration means that you agree to</span>
          <span className="hidden sm:inline-block">&nbsp;</span>
          <span className="block sm:inline-block">
            DriveClean&apos;s&nbsp;
            <span className="text-blue-500 italic">User Agreement</span>
            <span>&nbsp;&&nbsp;</span>
            <span className="text-blue-500 italic">User Privacy</span>
          </span>
        </span>
      </div>
    </div>
  );
}
