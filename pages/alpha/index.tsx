import CarDetail from "@components/car/car-detail";
import Layout from "@components/common/layout";
import Login from "@components/login/login";
import Profile from "@components/profile/profile";
import ProfileEdit from "@components/profile/profile-edit";
import Shop from "@components/shop/shop";
import ShopDetail from "@components/shop/shop-detail";
import Space from "@components/space/space";
import Storage from "@components/storage/storage";
import { useParam } from "@lib/hooks";
import Wallet from "@components/wallet/wallet";
import Charge from "@components/charge/charge";
import CarMint from "@components/car/car-mint";

/**
 * 入口函数，用于向各个实际页面路由
 * @returns {JSX.Element} 实际需要展示的页面
 */
export default function Alpha() {
  const p = useParam("p"); // p为当前url中p参数的值，指向实际需要路由的页面
  return !p ? (
    <Login />
  ) : p === "login" ? (
    <Login />
  ) : (
    <Layout>
      {p === "space" && <Space />}
      {p === "charge" && <Charge />}
      {p === "car_detail" && <CarDetail />}
      {p === "car_mint" && <CarMint />}
      {p === "storage" && <Storage />}
      {p === "shop" && <Shop />}
      {p === "shop_detail" && <ShopDetail />}
      {p === "profile" && <Profile />}
      {p === "profile_edit" && <ProfileEdit />}
      {p === "wallet" && <Wallet />}
    </Layout>
  );
}
