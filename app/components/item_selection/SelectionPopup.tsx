import { useFetcher } from "@remix-run/react";
import {
  ChevronDown as ChevronDownIcon,
  Table as ColumnIcon,
  SlidersHorizontal as FilterIcon,
  LayoutGrid as GridIcon,
  Loader,
  Minus as MinusIcon,
  Plus as PlusIcon,
  RotateCw as RefreshIcon,
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  X as XIcon,
} from "lucide-react";
import React, { useState } from "react";
import { useAccount } from "wagmi";

import placeholderImg from "../../assets/placeholder.png";
import { LoaderIcon } from "../Icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/Accordion";
import { Button } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import IconToggle from "../ui/IconToggle";
import { Label } from "../ui/Label";
import { MultiSelect } from "../ui/MultiSelect";
import { NumberSelect } from "../ui/NumberSelect";
import { ScrollArea } from "../ui/ScrollArea";
import Searchbar from "../ui/Searchbar";
import type { TroveFilters } from "~/api/tokens.server";
import { TransparentDialogContent } from "~/components/ui/Dialog";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { TroveToken } from "~/types";

interface ItemCardProps {
  name: string;
  owned: boolean;
  id: number;
  info: string;
  image: string;
}

const ItemCard = ({
  item,
  onClick,
}: {
  item: TroveToken;
  onClick: () => void;
}) => (
  <div
    className={cn(
      "relative cursor-pointer flex-col overflow-hidden rounded-lg bg-night-900"
      // selected && "border border-night-100"
    )}
  >
    {/* {selected && (
      <div className="absolute right-2 top-2 z-20 flex h-4 w-4 items-center justify-center rounded-[3px] border-2 border-night-1200 bg-night-100 text-night-1200">
        <CheckIcon className="w-3" />
      </div>
    )} */}

    <div className="relative w-full overflow-hidden">
      <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-honey-800/10 text-honey-400">
        <StarIcon className="h-3 w-3" />
      </div>
      <img src={item.image.uri} alt={item.tokenId} className="w-full" />
    </div>
    <div className="p-3">
      <p className="text-sm font-medium text-night-100">{item.metadata.name}</p>
      <p className="text-night-400">{item.tokenId}</p>
    </div>
    <button className="absolute inset-0" onClick={onClick}>
      <span className="sr-only">Select {item.metadata.name}</span>
    </button>
  </div>
);

export const SelectionPopup = ({ token }: { token: PoolToken }) => {
  const [selectedItems, setSelectedItems] = useState<TroveToken[]>([]);
  const [activeTab, setActiveTab] = useState<string>("filters");
  const fetcher = useFetcher<TroveToken[]>();
  const filterFetcher = useFetcher<TroveFilters>();
  const { load } = fetcher;
  const { load: loadFilters } = filterFetcher;
  const { address } = useAccount();

  React.useEffect(() => {
    if (!address || !token.isNft) {
      return;
    }

    const params = new URLSearchParams({
      address,
      slug: token.urlSlug,
    });

    loadFilters(`/resources/get-filters/${token.urlSlug}`);
    load(`/resources/get-collection/?${params.toString()}`);
  }, [address, token.isNft, load, token.urlSlug, loadFilters]);

  const selectionHandler = (item: TroveToken) => {
    if (selectedItems.includes(item)) {
      const itemIndex = selectedItems.findIndex(
        (i) => i.tokenId === item.tokenId
      );
      setSelectedItems([
        ...selectedItems.slice(0, itemIndex),
        ...selectedItems.slice(itemIndex + 1),
      ]);
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  return (
    <TransparentDialogContent className="h-full grid-areas-nft-modal [grid-template-columns:repeat(4,20%)_1fr] [grid-template-rows:auto_auto_1fr_1fr_1fr] sm:max-w-8xl">
      <div className="flex items-center gap-2 grid-in-header">
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
      <div className="space-y-4 grid-in-misc">
        <div className="flex items-center gap-3">
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
            <RefreshIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-honey-800/10 p-2 text-honey-400">
          <StarIcon className="h-6 w-4" />
          <span className="font-medium text-night-100">6 of your 7 </span>{" "}
          initial deposited items are still available
        </div>
      </div>
      <div className="overflow-auto rounded-lg bg-night-1100 p-4 grid-in-nft">
        <div className="grid grid-cols-5 gap-3 overflow-auto">
          {fetcher.data?.map((item) => (
            <ItemCard
              key={item.tokenId}
              item={item}
              onClick={() => selectionHandler(item)}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-lg bg-night-1100 p-3 grid-in-selection">
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
        <ScrollArea className="relative h-full">
          {activeTab === "filters" ? (
            <>
              {filterFetcher.state === "loading" ? (
                <div className="flex h-full items-center justify-center">
                  <LoaderIcon className="h-8 w-8 " />
                </div>
              ) : filterFetcher.state === "idle" && filterFetcher.data ? (
                <Accordion type="multiple" className="space-y-2">
                  {filterFetcher.data?.map((filter) => (
                    <AccordionItem
                      className="rounded-md border-none bg-night-1000"
                      value={filter.traitName}
                      key={filter.traitName}
                    >
                      <AccordionTrigger className="p-4 text-night-100">
                        {filter.traitName}
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <div className="flex flex-col gap-2.5">
                          {filter.values.map((value) => (
                            <div
                              className="flex w-full items-center justify-between"
                              key={value.valueName}
                            >
                              <LabeledCheckbox id={value.valueName}>
                                <span className="capitalize">
                                  {value.valueName}
                                </span>
                              </LabeledCheckbox>

                              <div className="flex items-center gap-2">
                                <p className="font-medium text-night-100">7</p>
                                <p className="text-night-400">(15.22%)</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : null}
            </>
          ) : (
            <div className="flex min-h-full flex-col">
              <p className="px-3 text-sm leading-[160%] text-night-400">
                Selected assets
              </p>
              <div className="flex flex-1 flex-col gap-2">
                {selectedItems.map((item) => (
                  <div
                    className="flex w-full items-center justify-between rounded-lg bg-night-900 p-2"
                    key={item.tokenId}
                  >
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image.uri}
                          alt={item.metadata.name}
                          className="h-10 w-10 rounded-[4px]"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-[4px] bg-night-800" />
                      )}
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-night-100">
                          {item.metadata.name}
                        </p>
                        <p className="text-sm text-night-400">{item.tokenId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {token.type === "ERC1155" && <NumberSelect max={0} />}
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
              <div className="sticky bottom-0 flex w-full flex-col gap-3 bg-night-1100/50 backdrop-blur-sm">
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
        </ScrollArea>
      </div>
    </TransparentDialogContent>
  );
};
