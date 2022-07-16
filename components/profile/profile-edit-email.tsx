import Button from "@components/common/button";
import Input from "@components/common/input";
import { useCountdown } from "@lib/hooks";
import { useAppSelector } from "app/hooks";
import { selectUser } from "app/reducers/user";
import classNames from "classnames";
import { EMAIL_VERIFY_CODE_EXPIRED_TIME, EMAIL_VERIFY_CODE_KEY } from "constants/constants";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

interface IFormValues {
  newEmail: string;
  verificationCode: string;
}

/**
 * 修改邮箱页面
 * @returns 修改邮箱页面
 */
export default function ProfileEditEmail() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormValues>();
  const newEmailReg = register("newEmail", {
    required: "* New email cannot be empty",
  });
  const verificationCodeReg = register("verificationCode", {
    required: "* Verification Code cannot be empty",
  });
  const onSubmit = async (data) => {
    console.log(data);
    await new Promise((r) => setTimeout(r, 1000));
    router.back();
  };
  const { count, startCounting } = useCountdown(EMAIL_VERIFY_CODE_KEY, EMAIL_VERIFY_CODE_EXPIRED_TIME);
  return (
    <div className="relative w-full animate-in slide-in-from-right-16 duration-500 flex-1 flex flex-col">
      <form
        className="relative w-full flex-1 px-8 pt-4 pb-8 flex flex-col items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative w-full flex-1">
          <label htmlFor="newEmail" className="text-lg sm:text-xl font-semibold text-gray-500">
            New Email
          </label>
          <Input
            id="newEmail"
            type="email"
            style="mt-2"
            placeholder="email@example.com"
            onChange={newEmailReg.onChange}
            onBlur={newEmailReg.onBlur}
            name={newEmailReg.name}
            inputRef={newEmailReg.ref}
          />
          <div className="relative w-full text-sm text-red-500 min-h-6">{errors.newEmail?.message}</div>

          <label htmlFor="verificationCode" className="relative text-lg sm:text-xl font-semibold text-gray-500">
            Verification Code
          </label>
          <div className="relative mt-2 w-full flex flex-col justify-center">
            <Input
              id="verificationCode"
              type="text"
              style="relative"
              onChange={verificationCodeReg.onChange}
              onBlur={verificationCodeReg.onBlur}
              name={verificationCodeReg.name}
              inputRef={verificationCodeReg.ref}
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
          <div className="w-full text-sm text-red-500 min-h-6">{errors.verificationCode?.message}</div>
        </div>
        <div className="relative w-full flex justify-center">
          <Button type="submit" style="min-h-0 h-10" isLoading={isSubmitting} disabled={isSubmitting}>
            SAVE
          </Button>
        </div>
      </form>
    </div>
  );
}
