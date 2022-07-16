import { createContext, FC, ReactNode, useCallback, useContext, useState } from "react";
import Loading, { LoadingProps } from "./loading";

export interface LoadingContextState extends LoadingProps {
  setLoading(props: LoadingProps): void; // 修改loading状态，如果不传递message则将message自动置空
}

export const LoadingContext = createContext<LoadingContextState>({} as LoadingContextState);

export function useLoading(): LoadingContextState {
  return useContext(LoadingContext);
}

export const LoadingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [props, setProps] = useState<LoadingProps>({ visible: false });
  const setLoading = useCallback(({ visible, message }: LoadingProps) => {
    setProps({ visible, message: message ? message : "" });
  }, []);

  return (
    <LoadingContext.Provider value={{ visible: props.visible, message: props.message, setLoading }}>
      {children}
      <Loading visible={props.visible} message={props.message} />
    </LoadingContext.Provider>
  );
};
