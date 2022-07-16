import { useLoading } from "@components/common/loading-provider";
import Item from "@components/item/item";
import ItemTypeTab from "@components/item/item-type-tab";
import useDC from "@lib/dc/dc";
import { useLayout } from "@lib/hooks";
import { carRarityToString, carTypeToString, dcNFTCarToItem } from "@lib/utils";
import { IItem } from "@model/model";
import { dc_nft_cars } from "@prisma/client";
import { ResDataForGetListedNFTCars } from "pages/api/nft/get_listed_nft_cars";
import { useEffect, useState, Fragment, useCallback } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";

const fakePartList = [
  { nid: "1", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "11.17" },
  { nid: "2", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "18.69" },
  { nid: "3", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "6.32" },
  { nid: "4", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "8.83" },
  { nid: "5", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "999.99" },
  { nid: "6", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "11.17" },
  { nid: "7", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "18.69" },
  { nid: "8", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "6.32" },
  { nid: "9", type: "part", pic: "/icons/double-exhaust-pipe.svg", mint: 2, level: 5, price: "8.83" },
];

const sortOptions = [
  { name: "Ascending", sortingOption: "asc" },
  { name: "Descending", sortingOption: "desc" },
  { name: "Default", sortingOption: "default" },
];
const filters = [
  {
    id: "type",
    name: "Type",
    options: [
      { value: "pickup", label: "Pickup Truck" },
      { value: "sports", label: "Sports Car" },
      { value: "super", label: "Super Car" },
    ],
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * shop首页
 * @returns shop首页
 */
export default function Shop() {
  useLayout();
  const { call } = useDC();
  const { setLoading } = useLoading();
  const [type, setType] = useState("cars");
  const [listedCars, setListedCars] = useState<IItem[]>();
  const [sortingOption, setSortingOption] = useState("desc");
  const [open, setOpen] = useState(false);

  const getListedCars = useCallback(async () => {
    setLoading({ visible: true, message: "Loading items..." });

    const resp: ResDataForGetListedNFTCars = await call({
      method: "get",
      path: "/nft/get_listed_nft_cars",
    });
    console.log("resp", resp);
    setLoading({ visible: false });

    // convert nft cars to IUser
    const listedCars: IItem[] = resp?.data?.map((car: dc_nft_cars) => dcNFTCarToItem(car));

    setListedCars(listedCars);
  }, [call, setLoading]);

  const getSortedItems = (items: IItem[]) => {
    if (!items) return null;

    const sortedItems = [].concat(items).sort((a: IItem, b: IItem) => {
      if (sortingOption === "asc") {
        return Number(a.price) - Number(b.price);
      } else if (sortingOption === "desc") {
        return Number(b.price) - Number(a.price);
      } else {
        return 0;
      }
    });
    console.log("sortedItems", sortedItems);

    return sortedItems;
  };

  useEffect(() => {
    getListedCars();
  }, [getListedCars]);

  return (
    <div className="relative w-full px-8 animate-in fade-in duration-500">
      <ItemTypeTab type={type} setType={setType}></ItemTypeTab>

      {/* Sort filter */}
      <section aria-labelledby="filter-heading" className="pt-4">
        <div className="flex items-center justify-between">
          <Menu as="div" className="relative z-10 inline-block text-left">
            <div>
              <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                Sort
                <ChevronDownIcon
                  className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-left absolute left-0 z-10 mt-2 w-40 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <Menu.Item key={JSON.stringify(option)}>
                      {({ active }) => (
                        <div
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block px-4 py-2 text-sm font-medium text-gray-900"
                          )}
                          onClick={() => setSortingOption(option.sortingOption)}
                        >
                          {option.name}
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </section>

      {type === "cars" && (
        <div className="relative w-full pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 font-medium animate-in fade-in duration-500">
          {getSortedItems(listedCars)?.map(
            (item) => item && <Item key={item.nid} item={item} location="shop" cleanUpAfterSuccess={getListedCars} />
          )}
        </div>
      )}
      {type === "parts" && (
        <div className="relative w-full pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 font-medium animate-in fade-in duration-500">
          {fakePartList.map((item) => (
            <Item key={item.nid} item={item as IItem} location="shop" cleanUpAfterSuccess={getListedCars} />
          ))}
        </div>
      )}
    </div>
  );
}
