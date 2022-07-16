import { createContext, FC, ReactNode, useCallback, useContext, useState } from "react";
import Modal, { ModalProps } from "./modal";

export const ModalContext = createContext<ModalProps>({} as ModalProps);

export function useModal(): ModalProps {
  return useContext(ModalContext);
}

export interface ModalProviderProps {
  visible: boolean; // 是否显示modal
  title?: string; // modal标题
  children?: React.ReactNode; // modal内的内容
}

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [props, setProps] = useState<ModalProviderProps>({ visible: false });
  const setModal = useCallback(({ visible, title, children }: ModalProviderProps) => {
    setProps({ visible, title: title ? title : "", children: children ? children : <></> });
  }, []);

  return (
    <ModalContext.Provider value={{ visible: props.visible, title: props.title, children: props.children, setModal }}>
      {children}
      <Modal visible={props.visible} title={props.title} setModal={setModal}>
        {props.children}
      </Modal>
    </ModalContext.Provider>
  );
};
