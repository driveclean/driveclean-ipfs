import classNames from "classnames";

/**
 * nft类型选择tab
 * @param param type nft类型 setType 修改nft类型
 * @returns
 */
export default function ItemTypeTab({ type = "cars", setType }: { type: string; setType: (type: string) => void }) {
  return (
    <div className="relative w-full h-10 rounded-full bg-green-50 border border-gray-900 flex justify-evenly items-center">
      <div
        className={classNames([
          "relative w-full h-full rounded-full flex justify-center items-center",
          type === "cars" && "bg-green-200 border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900",
        ])}
        onClick={() => setType("cars")}
      >
        <span className="text-lg sm:text-xl font-semibold text-gray-900">Cars</span>
      </div>
      <div
        className={classNames([
          "relative w-full h-full rounded-full flex justify-center items-center",
          type === "parts" && "bg-green-200 border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900",
        ])}
        onClick={() => setType("parts")}
      >
        <span className="text-lg sm:text-xl font-semibold text-gray-900">Parts</span>
      </div>
    </div>
  );
}
