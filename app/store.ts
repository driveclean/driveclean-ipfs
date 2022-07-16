import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "./storage"; // defaults to localStorage for web

import { rootReducer } from "./reducers/root";

const persistConfig = {
  key: "dc", // 持久化key名称
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export function makeStore() {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
}

const store = makeStore();

export type AppState = ReturnType<typeof store.getState>;

// 请在任何需要使用原生redux的地方，使用useAppDispatch获取store
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>;

export default store;
