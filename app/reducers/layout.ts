import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppState } from "../store";

/**
 * 全局样式状态
 */
export interface ILayout {
  isNeedBack?: boolean; // 是否需要按钮，默认为false，需要后按钮则会隐藏头像
  isNeedWallet?: boolean; // 是否需要钱包，默认为true
  title?: string; // 页面标题，默认为空
  headerStyle?: string; // 自定义样式，默认为"bg-[#f9fafb] animate-in fade-in duration-500"，请传入合法的tailwindcss类名字符串
}

// 初始/默认全局样式
const initialState: ILayout = {
  isNeedBack: false,
  isNeedWallet: true,
  title: "",
  headerStyle: "bg-[#f9fafb] animate-in fade-in duration-500",
};

// 用于存储全局样式
export const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    /**
     * 更新全局状态，如果未传递某个位置，则还原为默认值
     * @param state 当前状态
     * @param action action
     */
    updateLayout: (state, action?: PayloadAction<ILayout>) => {
      Object.keys(initialState).forEach((key) => {
        if (typeof action.payload[key] !== "undefined") {
          state[key] = action.payload[key];
        } else {
          state[key] = initialState[key];
        }
      });
    },
  },
});

export const { updateLayout } = layoutSlice.actions;
export const selectLayout = (state: AppState) => state.layout;
export default layoutSlice.reducer;
