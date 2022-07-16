import { useParam } from "@lib/hooks";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { updateLayout } from "app/reducers/layout";
import { useEffect, useRef, useState } from "react";
import ProfileEditName from "./profile-edit-name";
import ProfileEditIndex from "./profile-edit-index";
import ProfileEditEmail from "./profile-edit-email";

/**
 * 个人资料修改导航，根据url中的setting_key参数来判断需要展示的页面
 * @returns 个人资料修改导航
 */
export default function ProfileEdit() {
  const dispatch = useAppDispatch();
  const settingKey = useParam("setting_key");
  useEffect(() => {
    // 如果正在设置某个内容，则在header中设置title
    if (settingKey) {
      dispatch(updateLayout({ isNeedBack: true, isNeedWallet: false, title: (settingKey as string).toUpperCase() }));
    } else {
      dispatch(
        updateLayout({
          isNeedBack: true,
          isNeedWallet: false,
          headerStyle: "bg-green-100 animate-in slide-in-from-right-16 duration-500",
        })
      );
    }
  }, [dispatch, settingKey]);

  // 根据query中setting_key的值来判断首页或特定设置项
  return settingKey ? (
    (settingKey.toLowerCase() === "name" && <ProfileEditName />) ||
      (settingKey.toLowerCase() === "email" && <ProfileEditEmail />) || <></>
  ) : (
    <ProfileEditIndex />
  );
}
