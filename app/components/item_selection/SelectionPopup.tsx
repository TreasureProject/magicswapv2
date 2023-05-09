import { Close } from "@radix-ui/react-dialog";
import { useFetcher } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckIcon,
  TableIcon as ColumnIcon,
  Filter,
  LayoutGridIcon as GridIcon,
  RotateCwIcon as RefreshIcon,
  SearchIcon,
  SettingsIcon,
  X,
  XIcon,
} from "lucide-react";
import React, { useState } from "react";
import { useAccount } from "wagmi";

import { LoaderIcon } from "../Icons";
import { Button } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import IconToggle from "../ui/IconToggle";
import { NumberSelect } from "../ui/NumberSelect";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { ScrollArea } from "../ui/ScrollArea";
import type { TroveFilters } from "~/api/tokens.server";
import { TransparentDialogContent } from "~/components/ui/Dialog";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { CollectionLoader } from "~/routes/resources.get-collection";
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
        <CheckIcon className="w-3" />
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

const TraitFilterBadge = ({ trait }: { trait: string }) => {
  const [key, value] = trait.split(":");

  return (
    <span
      key={`${key}:${value}`}
      className="m-1 inline-flex flex-shrink-0 items-center rounded-full border-transparent bg-secondary py-1.5 pl-3 pr-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
    >
      <p className="space-x-1 text-xs">
        <span className="inline-block capitalize">{key}</span>
        <span className="text-night-300">is</span>
        <span className="inline-block capitalize">{value}</span>
      </p>
      <input type="hidden" name="deleteTrait" value={`${key}:${value}`} />
      <button
        type="submit"
        className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-night-400 hover:bg-night-1000"
      >
        <span className="sr-only">Remove filter for {value}</span>
        <X className="h-2 w-2" />
      </button>
    </span>
  );
};

export const SelectionPopup = ({
  token,
  type,
  onSubmit,
  selectedTokens,
}: {
  token?: PoolToken;
  type: "vault" | "inventory";
  onSubmit: (items: TroveTokenWithQuantity[]) => void;
  selectedTokens?: TroveTokenWithQuantity[];
}) => {
  const [selectedItems, setSelectedItems] = useState<TroveTokenWithQuantity[]>(
    selectedTokens || []
  );
  const fetcher = useFetcher<CollectionLoader>();
  const filterFetcher = useFetcher<TroveFilters>();
  const { load, Form, submit, formData, state, data } = fetcher;
  const { load: loadFilters } = filterFetcher;
  const { address } = useAccount();
  const traitInfoRef = React.useRef<string>("");
  const queryFormRef = React.useRef<HTMLFormElement>(null);

  const vaultTokenIds = token?.reserveItems
    .map(({ tokenId }) => tokenId)
    .join(",");
  const fetchFromVault = type === "vault";

  // Save trait string info to a ref, so when a user clicks Refresh, we can use it to refetch the data with the same filters
  React.useEffect(() => {
    if (formData) {
      const traitsInfo = formData.getAll("traits")[0];

      if (typeof traitsInfo === "string") {
        traitInfoRef.current = traitsInfo;
      }
    }
  }, [formData]);

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
    if (selectedItems.some((i) => i.tokenId === item.tokenId)) {
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

  const selectedTraitCount = data?.traits ? data?.traits.length : 0;

  const filterWithValues = (filterFetcher.data || []).filter(
    (d) => d.values.length > 0
  );

  const HiddenInputs = (
    <>
      <input type="hidden" name="tokenIds" value={vaultTokenIds} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="address" value={address} />
      <input type="hidden" name="slug" value={token.urlSlug} />
    </>
  );

  return (
    <TransparentDialogContent className="h-full grid-areas-nft-modal-mobile [grid-template-rows:auto_auto_1fr_1fr_1fr] sm:max-w-8xl lg:grid-areas-nft-modal lg:[grid-template-columns:repeat(4,1fr)_25%]">
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
          <Form
            ref={queryFormRef}
            className="flex flex-1"
            onChange={(e) => {
              const formData = new FormData(e.currentTarget);
              formData.set("query", formData.get("query") || "");

              submit(formData, {
                replace: true,
                method: "get",
                action: "/resources/get-collection",
              });
            }}
          >
            {HiddenInputs}
            <div className="flex w-full items-center gap-2 rounded-lg bg-night-1000 px-2 text-night-600">
              <SearchIcon className="h-4 w-4 " />
              <input
                type="text"
                name="query"
                className="w-full border-none bg-transparent text-sm outline-none"
                placeholder="Search name or token ID"
              />
            </div>
          </Form>
          <button className="rounded-md bg-night-1000 px-2 text-night-600 transition-colors hover:bg-night-900 hover:text-night-100">
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
        {/* <div className="flex items-center gap-2 rounded-md bg-honey-800/10 p-2 text-honey-400">
          <StarIcon className="h-6 w-4" />
          <span className="font-medium text-night-100">6 of your 7 </span>{" "}
          initial deposited items are still available
        </div> */}
      </div>
      <div className="flex flex-col overflow-hidden rounded-lg grid-in-nft">
        <Form
          onChange={(e) => {
            // called when user selects a filter
            const formData = new FormData(e.currentTarget);
            const traits = formData.getAll("traits");
            const traitsString = traits.join(",");
            formData.set("traits", traitsString);

            queryFormRef.current?.reset();

            submit(formData, {
              replace: true,
              method: "get",
              action: "/resources/get-collection",
            });
          }}
          onSubmit={(e) => {
            // onSubmit is only called when a user removes a filter
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const targetTrait = formData.getAll("deleteTrait")[0];

            const filteredTraits = data?.traits.filter(
              (t) => t !== targetTrait
            );

            if (!filteredTraits) return;

            formData.set("traits", filteredTraits.join(","));

            submit(formData, {
              replace: true,
              method: "get",
              action: "/resources/get-collection",
            });
          }}
        >
          {HiddenInputs}
          <Popover>
            <div className="flex space-x-2 divide-x divide-night-800 bg-night-1000 px-4 py-2">
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "group flex flex-shrink-0 items-center",
                    selectedTraitCount === 0 && "text-night-500"
                  )}
                >
                  <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span className="mr-1 tabular-nums">
                    {selectedTraitCount}
                  </span>
                  <span>Filter(s)</span>
                </Button>
              </PopoverTrigger>
              <div className="flex w-full items-center overflow-x-auto pl-2">
                {data &&
                  data.traits.map((trait) => (
                    <TraitFilterBadge trait={trait} key={trait} />
                  ))}
              </div>
            </div>
            <PopoverContent
              align="start"
              className="h-96 overflow-auto sm:min-w-[45rem]"
            >
              {filterFetcher.state === "loading" ? (
                <div className="flex h-full items-center justify-center">
                  <LoaderIcon className="h-8 w-8 " />
                </div>
              ) : filterFetcher.state === "idle" && filterFetcher.data ? (
                <div className="py-2">
                  {filterWithValues ? (
                    <div
                      className={cn(
                        "grid grid-cols-2 gap-x-4 gap-y-12 px-4 sm:grid-cols-2",
                        {
                          "sm:grid-cols-3": filterWithValues.length === 3,
                          "sm:grid-cols-4": filterWithValues.length > 3,
                        }
                      )}
                    >
                      {filterWithValues.map((filter) => {
                        return (
                          <fieldset key={filter.traitName}>
                            <legend className="text-sm font-medium text-night-100">
                              {filter.traitName}
                            </legend>
                            <div className="space-y-6 pt-4">
                              {filter.values.map((value) => {
                                return (
                                  <div
                                    key={`${filter.traitName}:${value.valueName}`}
                                    className="flex items-center"
                                  >
                                    <LabeledCheckbox
                                      id={`${filter.traitName}:${value.valueName}`}
                                      name="traits"
                                      defaultChecked={
                                        data?.traits.includes(
                                          `${filter.traitName}:${value.valueName}`
                                        ) || false
                                      }
                                      value={`${filter.traitName}:${value.valueName}`}
                                    >
                                      <span className="cursor-pointer text-xs capitalize">
                                        {value.valueName}
                                      </span>
                                    </LabeledCheckbox>
                                  </div>
                                );
                              })}
                            </div>
                          </fieldset>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </PopoverContent>
          </Popover>
        </Form>

        <div className="relative flex-1 overflow-auto bg-night-1100 p-4">
          {state === "loading" || state === "submitting" ? (
            <div className="flex h-full items-center justify-center">
              <LoaderIcon className="h-8 w-8" />
            </div>
          ) : state === "idle" && data ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {data.tokens.map((item) => (
                <ItemCard
                  selected={selectedItems.some(
                    (i) => i.tokenId === item.tokenId
                  )}
                  key={item.tokenId}
                  item={item}
                  onClick={() => {
                    selectionHandler({
                      ...item,
                      quantity: 1,
                    });
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-lg bg-night-1100 p-3 grid-in-selection">
        <ScrollArea className="relative h-full">
          <div className="flex min-h-full flex-col">
            <p className="px-3 text-sm leading-[160%] text-night-400">
              Selected assets
            </p>
            {selectedItems.length > 0 ? (
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
            ) : (
              <p className="flex grow items-center justify-center text-xs text-night-600">
                You haven't selected any assets yet.
              </p>
            )}
            <div className="sticky bottom-0 space-y-3 bg-night-1100/50 backdrop-blur-sm">
              {/* <div className="flex items-center justify-between rounded-lg bg-night-800 p-4">
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
                </div> */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => setSelectedItems([])}
                >
                  Clear
                </Button>
                <Close asChild>
                  <Button
                    size="md"
                    onClick={() => {
                      onSubmit(selectedItems);
                    }}
                  >
                    Save selections
                  </Button>
                </Close>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </TransparentDialogContent>
  );
};
