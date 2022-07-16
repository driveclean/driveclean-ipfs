import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user";
import layoutReducer from "./layout";
import bucketReducer from "./bucket";

export const rootReducer = combineReducers({
  user: userReducer,
  layout: layoutReducer,
  bucket: bucketReducer,
});
