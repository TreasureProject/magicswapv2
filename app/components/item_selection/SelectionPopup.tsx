import {
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  Table as ColumnIcon,
  SlidersHorizontal as FilterIcon,
  LayoutGrid as GridIcon,
  Minus as MinusIcon,
  Plus as PlusIcon,
  RotateCw as RefreshIcon,
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  X as XIcon,
} from "lucide-react";
import React, { useState } from "react";

import placeholderImg from "../../assets/placeholder.png";
import { CheckBox } from "../CheckBox";
import { Button } from "../ui/Button";
import IconToggle from "../ui/IconToggle";
import { MultiSelect } from "../ui/MultiSelect";
import { NumberSelect } from "../ui/NumberSelect";
import Searchbar from "../ui/Searchbar";
import { DialogTrigger } from "~/components/ui/Dialog";
import { FullDialogPortal } from "~/components/ui/Dialog";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";

interface ItemCardProps {
  name: string;
  owned: boolean;
  id: number;
  info: string;
  image: string;
}

const exampleItems: ItemCardProps[] = [];

for (let i = 0; i < 20; i++) {
  const id = Math.floor(Math.random() * 900) + 100;
  const obj = {
    name: "Wildbreach",
    owned: i < 3,
    image: placeholderImg,
    id: id,
    info: "",
  };
  exampleItems.push(obj);
}

const exampleFilters = [
  {
    name: "category",
    values: [
      "alchemy",
      "arcana",
      "brewing",
      "enchanting",
      "leatherworking",
      "smithing",
    ],
  },
  {
    name: "Staking Boost",
    values: ["10%", "20%", "25%", "50%"],
  },
  {
    name: "tier",
    values: ["tier 1", "tier 2", "tier 3"],
  },
  {
    name: "clothing",
    values: ["test", "test2", "test3"],
  },
];

const ItemCard = ({
  item,
  selected,
}: {
  item: ItemCardProps;
  selected: boolean;
}) => (
  <div
    className={cn(
      "relative cursor-pointer flex-col overflow-hidden rounded-lg bg-night-900",
      selected && "border border-night-100"
    )}
  >
    {selected && (
      <div className="absolute right-2 top-2 z-20 flex h-4 w-4 items-center justify-center rounded-[3px] border-2 border-night-1200 bg-night-100 text-night-1200">
        <CheckIcon className="w-3" />
      </div>
    )}

    <div className="relative w-full overflow-hidden">
      <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-honey-800/10 text-honey-400">
        <StarIcon className="h-3 w-3 " />
      </div>
      <img src={item.image} alt={item.name} className="w-full" />
    </div>
    <div className="p-3">
      <p className="text-sm font-medium text-night-100">{item.name}</p>
      <p className="text-night-400">{item.id}</p>
    </div>
  </div>
);

export const SelectionPopup = ({ token }: { token: PoolToken }) => {
  const [selectedItems, setSelectedItems] = useState<ItemCardProps[]>([]);
  const [activeTab, setActiveTab] = useState<string>("filters");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);

  const selectionHandler = (item: ItemCardProps) => {
    if (selectedItems.includes(item)) {
      const itemIndex = selectedItems.findIndex((i) => i.id === item.id);
      setSelectedItems([
        ...selectedItems.slice(0, itemIndex),
        ...selectedItems.slice(itemIndex + 1),
      ]);
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const filterHandler = (filter: string) => {
    if (activeFilters.includes(filter)) {
      const itemIndex = activeFilters.findIndex((f) => f === filter);
      setActiveFilters([
        ...activeFilters.slice(0, itemIndex),
        ...activeFilters.slice(itemIndex + 1),
      ]);
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const expandFilterHandler = (filter: string) => {
    if (expandedFilters.includes(filter)) {
      const itemIndex = expandedFilters.findIndex((f) => f === filter);
      setExpandedFilters([
        ...expandedFilters.slice(0, itemIndex),
        ...expandedFilters.slice(itemIndex + 1),
      ]);
    } else {
      setExpandedFilters([...expandedFilters, filter]);
    }
  };

  return (
    <FullDialogPortal>
      <div className="h-full max-h-[960px] w-full max-w-6xl">
        <div className="mb-6 flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-md text-night-400">Withdraw</p>
            {token.image ? (
              <img
                className="h-6 w-6 rounded-full"
                src={token.image}
                alt={token.name}
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-night-900" />
            )}
            <p className="text-md font-medium capitalize text-night-100">
              {token.name}
            </p>

            <div className="flex gap-1">
              <div className="ml-2 flex h-9 cursor-pointer items-center gap-1 rounded-l-full bg-night-1000 px-4 text-night-400">
                <p className="text-sm text-night-400">
                  Showing <span className="font-medium text-night-100">T1</span>{" "}
                  Price
                </p>
                <ChevronDownIcon className="w-3" />
              </div>
              <div className="flex h-9 items-center gap-1 rounded-r-full bg-night-1000 px-4 text-night-400">
                <div className="h-5 w-5 rounded-full bg-night-800" />
                <p className="text-sm text-night-400">
                  <span className="font-medium text-night-100">42</span> MAGIC
                </p>
              </div>
            </div>
          </div>
          <DialogTrigger>
            <button
              className=" flex h-7 w-7 items-center justify-center rounded-full bg-night-800 text-night-400 transition-colors hover:bg-ruby-800 hover:text-night-1200"
              onClick={() => setSelectedItems([])}
            >
              <XIcon className="h-4 w-4 " />
            </button>
          </DialogTrigger>
        </div>
        <div className="flex h-full gap-6">
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full items-center gap-3">
              <Searchbar
                placeholder="Search name or paste address"
                className="w-full"
              />
              <button className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-md bg-night-1000 text-night-600 transition-colors  hover:bg-night-900 hover:text-night-100">
                <SettingsIcon className="h-4 w-4 " />
              </button>
              <IconToggle
                icons={[
                  {
                    id: "grid",
                    icon: GridIcon,
                  },
                  {
                    id: "column",
                    icon: ColumnIcon,
                  },
                ]}
              />
              <button className="flex h-9 w-9 items-center justify-center rounded-md text-night-600 transition-colors  hover:bg-night-1000 hover:text-night-100">
                <RefreshIcon className="h-4 w-4 " />
              </button>
            </div>
            <div className="text-md flex items-center gap-2 rounded-md bg-honey-800/10 p-2 text-honey-400">
              <StarIcon className="h-6 w-4" />
              <span className="font-medium text-night-100">
                6 of your 7{" "}
              </span>{" "}
              initial deposited items are still available
            </div>
            <div className="h-full w-full overflow-hidden rounded-lg bg-night-1100 p-4">
              <div className="grid  w-full grid-cols-5 gap-3  ">
                {exampleItems.map((item, index) => (
                  <div onClick={() => selectionHandler(item)} key={index}>
                    <ItemCard
                      selected={selectedItems.includes(item)}
                      item={item}
                    />{" "}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex min-w-[360px] flex-col gap-4 rounded-lg bg-night-1100 p-3">
            <MultiSelect
              tabs={[
                {
                  id: "filters",
                  name: "Filters",
                  icon: FilterIcon,
                },
                {
                  id: "items",
                  name: "Items",
                  icon: ShoppingCartIcon,
                  amount: 20,
                },
              ]}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            {activeTab === "filters" ? (
              <>
                {exampleFilters.map((filter) => (
                  <div
                    className="flex flex-col gap-3 rounded-md bg-night-1000 p-4 transition-all"
                    key={filter.name}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize leading-[160%] text-night-100">
                          {filter.name}
                        </p>
                        <p className=" py-.5 h-max rounded-lg bg-night-100 px-2 text-xs font-medium leading-[160%] text-night-1200">
                          22
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-[160%]  text-night-100">
                          2
                        </p>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-night-800"
                          onClick={() => expandFilterHandler(filter.name)}
                        >
                          {expandedFilters.includes(filter.name) ? (
                            <MinusIcon className="w-4 text-night-400" />
                          ) : (
                            <PlusIcon className="w-4 text-night-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedFilters.includes(filter.name) && (
                      <>
                        <Searchbar
                          placeholder="Search name or paste address"
                          className="h-10 w-full bg-night-800"
                        />
                        <div className="flex flex-col gap-2.5 py-2">
                          {filter.values.map((value) => (
                            <div
                              className="flex w-full items-center justify-between"
                              key={value}
                            >
                              <div className="flex items-center gap-3">
                                <CheckBox
                                  setChecked={() => filterHandler(value)}
                                  checked={activeFilters.includes(value)}
                                />
                                <p className="text-sm capitalize leading-[160%] text-night-400">
                                  {value}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-night-100">7</p>
                                <p className="text-night-400">(15.22%)</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="px-3 text-sm leading-[160%] text-night-400">
                    Selected assets
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedItems.map((item) => (
                      <div
                        className="flex w-full items-center justify-between rounded-lg bg-night-900 p-2"
                        key={item.name}
                      >
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded-[4px]"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-[4px] bg-night-800" />
                          )}
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-night-100">
                              {item.name}
                            </p>
                            <p className="text-sm text-night-400">{item.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <NumberSelect />
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-night-800"
                            onClick={() => selectionHandler(item)}
                          >
                            <XIcon className="w-4 text-night-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex w-full flex-col gap-3">
                  <div className="flex items-center justify-between rounded-lg bg-night-800 p-4">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-night-500">Total:</p>
                      <div className="h-4 w-4 rounded-full bg-night-700" />
                      <p className="font-night-100 text-sm font-medium">
                        {selectedItems.length * 10}.00
                      </p>
                    </div>
                    <button
                      className="text-sm font-medium text-sapphire-500 transition-colors hover:text-sapphire-300"
                      onClick={() => setSelectedItems([])}
                    >
                      Clear
                    </button>
                  </div>
                  <Button size="md" disabled={selectedItems.length === 0}>
                    Add to swap
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FullDialogPortal>
  );
};
