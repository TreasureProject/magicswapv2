import { Close } from "@radix-ui/react-dialog";
import { useFetcher } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Table as ColumnIcon,
  SlidersHorizontal as FilterIcon,
  LayoutGrid as GridIcon,
  RotateCw as RefreshIcon,
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  X as XIcon,
} from "lucide-react";
import React, { useState } from "react";
import { useAccount } from "wagmi";

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
import { MultiSelect } from "../ui/MultiSelect";
import { NumberSelect } from "../ui/NumberSelect";
import { ScrollArea } from "../ui/ScrollArea";
import Searchbar from "../ui/Searchbar";
import type { TroveFilters } from "~/api/tokens.server";
import { TransparentDialogContent } from "~/components/ui/Dialog";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { TroveToken, TroveTokenWithQuantity } from "~/types";

const ItemCard = ({
  selected,
  item,
  onClick,
}: {
  selected: boolean;
  item: TroveToken;
  onClick: () => void;
}) => (
  <div
    className={cn(
      "group relative flex-col overflow-hidden rounded-lg bg-night-900",
      selected && "ring-2 ring-night-100"
    )}
  >
    {selected && (
      <div className="absolute right-2 top-2 z-20 flex h-4 w-4 items-center justify-center rounded-[3px] border-2 border-night-1200 bg-night-100 text-night-1200">
        <Check className="w-3" />
      </div>
    )}
    <img
      src={item.image.uri}
      alt={item.tokenId}
      className="w-full group-hover:opacity-75"
    />
    <div className="p-3">
      <p className="text-sm font-medium text-night-100">{item.metadata.name}</p>
      <p className="text-night-400">{item.tokenId}</p>
    </div>
    <button className="absolute inset-0" onClick={onClick}>
      <span className="sr-only">Select {item.metadata.name}</span>
    </button>
  </div>
);

export const SelectionPopup = ({
  token,
  type,
  onSubmit,
  selectedTokenIds,
}: {
  token?: PoolToken;
  type: "vault" | "inventory";
  onSubmit: (items: TroveTokenWithQuantity[]) => void;
  selectedTokenIds?: TroveTokenWithQuantity[];
}) => {
  const [selectedItems, setSelectedItems] = useState<TroveTokenWithQuantity[]>(
    selectedTokenIds || []
  );
  const [activeTab, setActiveTab] = useState<string>("filters");
  const fetcher = useFetcher<TroveToken[]>();
  const filterFetcher = useFetcher<TroveFilters>();
  const { load, Form, submit, submission } = fetcher;
  const { load: loadFilters } = filterFetcher;
  const { address } = useAccount();
  const traitInfoRef = React.useRef<string>("");
  const vaultTokenIds = React.useMemo(
    () =>
      token?.reserveItems.reduce((acc, item) => {
        return `${acc},${item.tokenId}`;
      }, ""),
    [token?.reserveItems]
  );

  const fetchFromVault = type === "vault";

  // Save trait string info to a ref, so when a user clicks Refresh, we can use it to refetch the data with the same filters
  React.useEffect(() => {
    if (submission) {
      const traitsInfo = submission.formData.getAll("traits")[0];

      if (typeof traitsInfo === "string") {
        traitInfoRef.current = traitsInfo;
      }
    }
  }, [submission]);

  const fetchCollection = React.useCallback(() => {
    if (!address || !token?.isNft) {
      return;
    }

    const params = new URLSearchParams({
      slug: token.urlSlug,
    });

    if (fetchFromVault && vaultTokenIds) {
      params.set("type", "vault");
      params.set("tokenIds", vaultTokenIds);
    } else {
      params.set("type", "inventory");
      params.set("address", address);
    }

    if (traitInfoRef.current.length > 0) {
      params.set("traits", traitInfoRef.current);
    }
    load(`/resources/get-collection/?${params.toString()}`);
  }, [
    address,
    fetchFromVault,
    load,
    token?.isNft,
    token?.urlSlug,
    vaultTokenIds,
  ]);

  React.useEffect(() => {
    if (!token?.isNft) {
      return;
    }
    fetchCollection();
    loadFilters(`/resources/get-filters/${token.urlSlug}`);
  }, [token?.isNft, token?.urlSlug, loadFilters, fetchCollection]);

  const selectionHandler = (item: TroveTokenWithQuantity) => {
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

  if (!token) return null;

  return (
    <TransparentDialogContent className="h-full grid-areas-nft-modal [grid-template-columns:repeat(4,20%)_1fr] [grid-template-rows:auto_auto_1fr_1fr_1fr] sm:max-w-8xl">
      <div className="flex items-center gap-2 grid-in-header">
        <p className="text-md text-night-400">Select</p>
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
      </div>
      <div className="space-y-4 grid-in-misc">
        <div className="flex items-stretch gap-3">
          <Searchbar
            placeholder="Search name or paste address"
            className="w-full"
          />
          <button className="rounded-md bg-night-1000 px-2 text-night-600 transition-colors  hover:bg-night-900 hover:text-night-100">
            <SettingsIcon className="h-4 w-4" />
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
          <button
            onClick={fetchCollection}
            className="group rounded-md px-2 text-night-600 transition-colors hover:bg-night-1000 hover:text-night-100"
          >
            <RefreshIcon className="h-4 w-4 group-hover:animate-rotate-45" />
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-honey-800/10 p-2 text-honey-400">
          <StarIcon className="h-6 w-4" />
          <span className="font-medium text-night-100">6 of your 7 </span>{" "}
          initial deposited items are still available
        </div>
      </div>
      <div className="overflow-auto rounded-lg bg-night-1100 p-4 grid-in-nft">
        {fetcher.state === "loading" || fetcher.state === "submitting" ? (
          <div className="flex h-full items-center justify-center">
            <LoaderIcon className="h-8 w-8" />
          </div>
        ) : fetcher.state === "idle" && fetcher.data ? (
          <div className="grid grid-cols-6 gap-3">
            {fetcher.data.map((item) => (
              <ItemCard
                selected={selectedItems.some((i) => i.tokenId === item.tokenId)}
                key={item.tokenId}
                item={item}
                onClick={() =>
                  selectionHandler({
                    ...item,
                    quantity: 0,
                  })
                }
              />
            ))}
          </div>
        ) : null}
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
              amount: selectedItems.length,
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
                <Form
                  onChange={(e) => {
                    const formData = new FormData(e.currentTarget);
                    const traits = formData.getAll("traits");
                    const traitsString = traits.join(",");
                    formData.set("traits", traitsString);

                    submit(formData, {
                      replace: true,
                      method: "get",
                      action: "/resources/get-collection",
                    });
                  }}
                >
                  <input type="hidden" name="tokenIds" value={vaultTokenIds} />
                  <input type="hidden" name="type" value={type} />
                  <input type="hidden" name="address" value={address} />
                  <input type="hidden" name="slug" value={token.urlSlug} />
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
                                <LabeledCheckbox
                                  id={value.valueName}
                                  name="traits"
                                  value={`${filter.traitName}:${value.valueName}`}
                                >
                                  <span className="capitalize">
                                    {value.valueName}
                                  </span>
                                </LabeledCheckbox>

                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-night-100">
                                    7
                                  </p>
                                  <p className="text-night-400">(15.22%)</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Form>
              ) : null}
            </>
          ) : (
            <div className="flex min-h-full flex-col">
              <p className="px-3 text-sm leading-[160%] text-night-400">
                Selected assets
              </p>
              <div className="mt-2 flex flex-1 flex-col gap-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {selectedItems.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
                          <p className="text-sm text-night-400">
                            {item.tokenId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.contractType === "ERC1155" && (
                          <NumberSelect
                            onChange={(num) => {
                              setSelectedItems((prev) =>
                                prev.map((i) =>
                                  i.tokenId === item.tokenId
                                    ? { ...i, quantity: num }
                                    : i
                                )
                              );
                            }}
                            value={item.quantity}
                            max={
                              type === "inventory"
                                ? item.queryUserQuantityOwned || 1
                                : token.reserveItems.find(
                                    (i) => i.tokenId === item.tokenId
                                  )?.amount || 1
                            }
                          />
                        )}
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-night-800"
                          onClick={() => selectionHandler(item)}
                        >
                          <XIcon className="w-4 text-night-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                <Close asChild>
                  <Button
                    size="md"
                    onClick={() => {
                      onSubmit(selectedItems);
                    }}
                    disabled={selectedItems.length === 0}
                  >
                    Add to swap
                  </Button>
                </Close>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </TransparentDialogContent>
  );
};
