import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser, TokenPayload } from "../../model/model";
import type { AppState } from "../store";

const initialState: TokenPayload = {
  mid: "",
  wallet_pub: "",
  wallet_token: "",
  wallet_type: "",
  email: "",
  is_email_verified: false,
  uname: "",
  face: "",
  sex: 0,
  last_login_time: "0001-01-01 00:00:00",
  is_set_tesla_refresh_token: false,
  vehicle_id: "",
};

/**
 * 用于存储用户信息
 */
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /**
     * 保存/修改用户信息
     * @param state 当前状态
     * @param action action
     */
    updateUser: (state, action?: PayloadAction<TokenPayload>) => {
      Object.keys(initialState).forEach((key) => {
        if (typeof action.payload[key] !== "undefined") {
          state[key] = action.payload[key];
        }
      });
    },
  },
});

export const { updateUser } = userSlice.actions;
export const selectUser = (state: AppState) => state.user;
export default userSlice.reducer;
