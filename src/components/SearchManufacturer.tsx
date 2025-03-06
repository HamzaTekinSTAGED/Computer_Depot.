"use client";
import { SearchManufacturerProps } from "@/types";
import { Fragment, useState } from "react";
import Image from "next/image";
import { Combobox, Transition } from "@headlessui/react";
import { manufacturers } from "@/constants";
const SearchManufacturer = ({manufacturer, setManufacturer}: SearchManufacturerProps) => {
    const [query, setQuery] = useState("");

    const filteredManufacturers = query === " " ?
    manufacturers : manufacturers.filter(
        (item) => item.toLowerCase().includes(query.toLowerCase()));


    return (
        <div className="search-manufacturer">
            <Combobox value={manufacturer} onChange={setManufacturer}>
                <div className="relative w-full">
                <Combobox.Button className="absolute top-[14px]">
                    <Image src="/car-logo.svg" alt="Car Logo" width={20} height={20} className="ml-4" />
                </Combobox.Button>

                <Combobox.Input
                className="search-manufacturer__input"
                placeholder="Volkswagen"
                displayValue={(manufacturer: string) => manufacturer}
                onChange={(e) => setQuery(e.target.value)}
                />

                <Transition as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setQuery("")}
                >
                    <Combobox.Options>
                        {filteredManufacturers.map((item) => (
                            <Combobox.Option key={item} value={item}
                             className={({active}) => `relative search-manufacturer__option 
                             ${active ? "bg-primary-blue text-white" : "text-gray-900"}`}
                             >
                                {({selected, active}) => (
                                    <li className={`${selected ? "bg-primary-blue text-white" : "text-gray-900"}`}>
                                        {item} 
                                    </li>
                                )}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>

                </Transition>
                </div>
            </Combobox>
        </div>
    )
}

export default SearchManufacturer;
