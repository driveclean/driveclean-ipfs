import classNames from "classnames";
import { ChangeEventHandler, FocusEventHandler, HTMLInputTypeAttribute } from "react";

export interface IInput {
  id: string; // input的唯一标识
  type?: HTMLInputTypeAttribute | undefined; // input的类型
  style?: string; // 自定义input样式
  placeholder?: string; // input的placeholder
  maxLength?: number; // input的最大长度
  onChange?: ChangeEventHandler<HTMLInputElement>; // react-form-hooks中register的onChange事件
  onBlur?: FocusEventHandler<HTMLInputElement>; // react-form-hooks中register的onBlur事件
  name?: string; // react-form-hooks中register的name属性
  inputRef?: any; // react-form-hooks中register的inputRef属性
}
export default function Input({
  id,
  type = "text",
  style,
  placeholder,
  maxLength,
  onChange,
  onBlur,
  name,
  inputRef,
}: IInput) {
  return (
    <input
      id={id}
      type={type}
      step="any"
      className={classNames([
        "w-full text-sm sm:text-base rounded-md border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900 focus:shadow-[2px_2px] focus:shadow-gray-900 focus:border-gray-900 placeholder:text-sm placeholder:sm:text-base placeholder:italic placeholder:overflow-visible",
        style,
      ])}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      ref={inputRef}
    />
  );
}
