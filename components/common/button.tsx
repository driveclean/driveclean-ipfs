import classNames from "classnames";
import { ReactNode } from "react";
interface IButton {
  type?: "submit" | "reset" | "button" | undefined; // button的类型
  style?: string; // 自定义button样式
  isLoading?: boolean; // 是否显示loading，loading时点击将不可用
  disabled?: boolean; // 是否禁用button
  onClick?: () => void; // 点击button时触发的事件
  children?: ReactNode; // button的子元素
}

export default function Button({
  type = "button",
  style = "",
  isLoading = false,
  disabled = false,
  onClick,
  children,
}: IButton) {
  return (
    <button
      type={type}
      className={classNames([
        "relative btn rounded-full bg-green-200 hover:bg-green-300 focus:bg-green-300 text-gray-900 border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900",
        isLoading && "loading",
        disabled && "pointer-events-none bg-opacity-50 border-opacity-50 text-opacity-50 shadow-gray-50",
        style,
      ])}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
