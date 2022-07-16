import Button from "@components/common/button";
import useDC from "@lib/dc/dc";
import { useLayout } from "@lib/hooks";
import { Player } from "@lottiefiles/react-lottie-player";
import { selectUser } from "app/reducers/user";
import { BASE_PATH } from "constants/constants";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

/**
 * 个人资料页
 * @returns 个人资料页
 */
export default function Profile() {
  useLayout({
    isNeedBack: true,
    isNeedWallet: false,
    headerStyle: "bg-green-100 animate-in slide-in-from-left-16 duration-500",
  });
  const user = useSelector(selectUser);
  const router = useRouter();
  const { logout } = useDC();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();
  register("empty");
  const onSubmitLogout = async (data) => {
    console.log(data);
    console.log(123);
    await logout();
    console.log(321);
    router.push({ pathname: BASE_PATH, query: { p: "login" } });
  };
  const avatarRef = useRef(null);
  return (
    <div className="relative w-full animate-in slide-in-from-left-16 duration-500">
      <Link href={{ pathname: BASE_PATH, query: { p: "profile_edit" } }} passHref>
        <div className="relative w-full p-8 rounded-bl-3xl bg-green-100 flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full shadow-md bg-white">
            <Player
              ref={avatarRef}
              src="/icons/circled-user-male-skin-type-4.json"
              style={{ width: "4rem", height: "4rem" }}
              autoplay
              hover
            />
          </div>
          <div className="flex-1 flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{user.uname}</span>
            <span className="text-sm text-gray-400">{user.email}</span>
          </div>
          <Player
            ref={avatarRef}
            src="/icons/forward.json"
            style={{ width: "1rem", height: "1rem" }}
            autoplay
            hover
          ></Player>
        </div>
      </Link>
      <form
        className="relative w-full px-8 pt-2 flex flex-col justify-center items-center"
        onSubmit={handleSubmit(onSubmitLogout)}
      >
        <Button type="submit" style="min-h-0 h-10" isLoading={isSubmitting}>
          Logout
        </Button>
      </form>
    </div>
  );
}
