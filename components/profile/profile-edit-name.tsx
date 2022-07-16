import Button from "@components/common/button";
import useDC from "@lib/dc/dc";
import { useAppSelector } from "app/hooks";
import { selectUser } from "app/reducers/user";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

interface IFormValues {
  name: string;
}

/**
 * 修改用户名页面
 * @returns 修改用户名页面
 */
export default function ProfileEditName() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const { call } = useDC();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IFormValues>({ defaultValues: { name: user.uname } });
  const onSubmit = async (data: IFormValues) => {
    await call({
      method: "post",
      path: "/update_user",
      data: { uname: data.name },
    });
    router.back();
  };
  return (
    <div className="relative w-full animate-in slide-in-from-right-16 duration-500 flex-1 flex flex-col">
      <form
        className="relative w-full flex-1 px-8 pt-4 pb-8 flex flex-col items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative w-full flex-1">
          <label htmlFor="name" className="text-lg sm:text-xl font-semibold text-gray-900">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="block mt-2 w-full text-sm sm:text-base rounded-md border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900 focus:shadow-[2px_2px] focus:shadow-gray-900 focus:border-gray-900 placeholder:text-sm placeholder:sm:text-base placeholder:italic"
            placeholder="Name"
            {...register("name", {
              required: "* Name cannot be empty",
            })}
          />
          <div className="w-full text-sm text-red-500 min-h-[1.25rem]">{errors.name?.message}</div>
        </div>
        <div className="relative w-full flex justify-center">
          <Button
            type="submit"
            style="min-h-0 h-10"
            isLoading={isSubmitting}
            disabled={isSubmitting || user.uname === watch("name")}
          >
            SAVE
          </Button>
        </div>
      </form>
    </div>
  );
}
