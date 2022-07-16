import { CalendarIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { BASE_PATH } from "constants/constants";
import Link from "next/link";

/**
 * 设置项，用于在个人资料设置首页展示可编辑的设置项
 * @param param settingKey 设置项的key settingValue 设置项的value
 * @returns
 */
export default function SettingItem({ settingKey, settingValue }: { settingKey: string; settingValue: string }) {
  return (
    <Link href={`${BASE_PATH}?p=profile_edit&setting_key=${settingKey}`} passHref>
      <div className="relative w-full p-4 flex justify-center items-center sm:px-6">
        <div className="flex-1 flex justify-between items-center">
          <div className="text-base sm:text-lg font-bold text-gray-400">{settingKey}</div>
          <div className="flex-shrink-0 text-base sm:text-lg font-bold text-gray-900">{settingValue}</div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
