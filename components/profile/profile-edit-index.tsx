import { Player } from "@lottiefiles/react-lottie-player";
import { useAppSelector } from "app/hooks";
import { selectUser } from "app/reducers/user";
import { useRef } from "react";
import SettingItem from "./profile-edit-setting-item";

/**
 * 修改个人资料首页，展示所有可修改内容
 * @returns 修改个人资料首页
 */
export default function ProfileEditIndex() {
  const user = useAppSelector(selectUser);
  const avatarRef = useRef(null);
  return (
    <div className="relative w-full animate-in slide-in-from-right-16 duration-500">
      <div className="relative w-full p-8 rounded-br-3xl bg-green-100 flex justify-center items-center space-x-4">
        <div className="relative w-16 h-16 rounded-full shadow-md bg-white">
          <Player
            ref={avatarRef}
            src="/icons/circled-user-male-skin-type-4.json"
            style={{ width: "4rem", height: "4rem" }}
            autoplay
            hover
          />
        </div>
      </div>
      <div className="relative w-full flex flex-col">
        <SettingItem settingKey="Name" settingValue={user.uname} />
        <SettingItem settingKey="Email" settingValue={user.email} />
      </div>
    </div>
  );
}
