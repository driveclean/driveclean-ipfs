import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppState } from "../store";

/**
 * 临时数据
 */
export interface UpdateBucketAction {
  phantomConnectPublicKey?: string;
  phantomConnectSecret?: string;
  phantomEncryptionPublicKey?: string;
  phantomWalletPublicKey?: string;
  phantomWalletSession?: string;
  phantomMessage?: string;
}

const initialState: UpdateBucketAction = {
  phantomConnectPublicKey: "",
  phantomConnectSecret: "",
  phantomEncryptionPublicKey: "",
  phantomWalletPublicKey: "",
  phantomWalletSession: "",
  phantomMessage: "",
};

/**
 * 用于存储一些临时数据
 */
export const bucketSlice = createSlice({
  name: "bucket",
  initialState,
  reducers: {
    updateBucket: (state, action?: PayloadAction<UpdateBucketAction>) => {
      Object.keys(action.payload).forEach((key) => {
        if (typeof action.payload[key] !== "undefined") {
          state[key] = action.payload[key];
        }
      });
    },
  },
});

export const { updateBucket } = bucketSlice.actions;
export const selectBucket = (state: AppState) => state.bucket;
export default bucketSlice.reducer;
