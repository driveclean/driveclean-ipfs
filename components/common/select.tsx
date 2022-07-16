/* This example requires Tailwind CSS v2.0+ */
import { ChangeEventHandler, FocusEventHandler, Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import { Control, Controller } from "react-hook-form";

export interface SelectOptionProps {
  id: string;
  name: string;
}

export interface SelectProps {
  id: string;
  options: Array<SelectOptionProps>;
  selected: SelectOptionProps;
  setSelected: (selected: SelectOptionProps) => void;
  onChange?: any;
}

export default function Select({ id, options = [], selected, setSelected, onChange }: SelectProps) {
  return (
    <Listbox
      value={selected}
      onChange={(e) => {
        if (onChange) {
          onChange(e);
        }
        setSelected(e);
      }}
      disabled={options.length === 0}
    >
      {({ open }) => (
        <>
          <Listbox.Label className="hidden">{id}</Listbox.Label>
          <div className="mt-1 relative w-full">
            <Listbox.Button className="bg-white relative w-full rounded-md border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900 pl-3 pr-10 py-2 text-left cursor-default text-sm sm:text-base">
              <span className="block truncate">{selected ? selected.name : "No vehicle found"}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 w-full mt-1 py-1 bg-white max-h-60 rounded-md border-2 border-gray-900 shadow-[2px_2px] shadow-gray-900 overflow-auto text-sm sm:text-base">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    className={({ active }) =>
                      classNames(
                        active ? "text-gray-900 bg-gray-200" : "text-gray-900",
                        "cursor-default select-none relative py-2 pl-3 pr-9"
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={classNames(selected ? "font-semibold" : "font-normal", "block truncate")}>
                          {option.name}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-gray-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
