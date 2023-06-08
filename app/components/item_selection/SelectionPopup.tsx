import { Close } from "@radix-ui/react-dialog";
import { useFetcher } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  TableIcon as ColumnIcon,
  Filter,
  LayoutGridIcon as GridIcon,
  InfoIcon,
  RotateCwIcon as RefreshIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import React, { useState } from "react";
import { useAccount } from "wagmi";

import { CheckIcon, LoaderIcon } from "../Icons";
import { PoolTokenImage } from "../pools/PoolTokenImage";
import { Button } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import IconToggle from "../ui/IconToggle";
import { NumberSelect } from "../ui/NumberSelect";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import type { TroveFilters } from "~/api/tokens.server";
import { DialogContent } from "~/components/ui/Dialog";
import { ITEMS_PER_PAGE } from "~/consts";
import { useTrove } from "~/hooks/useTrove";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { CollectionLoader } from "~/routes/resources.get-collection";
import type { TroveToken, TroveTokenWithQuantity } from "~/types";

const ItemCard = ({
  selected,
  item,
  onClick,
  disabled,
  viewOnly,
}: {
  selected: boolean;
  item: TroveToken;
  onClick: () => void;
  disabled: boolean;
  viewOnly: boolean;
}) => {
  const { createTokenUrl } = useTrove();
  const disableUnselected = !selected && disabled;

  const innerCard = (
    <div className={cn(disableUnselected && "cursor-not-allowed opacity-30")}>
      {selected && (
        <div className="absolute right-2 top-2 z-20 flex h-4 w-4 items-center justify-center rounded-[3px] border-2 border-night-1200 bg-night-100 text-night-1200">
          <CheckIcon className="w-3" />
        </div>
      )}
      <img
        src={item.image.uri}
        alt={item.tokenId}
        className={cn(
          "w-full",
          !viewOnly && !disableUnselected && "group-hover:opacity-75"
        )}
      />
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="text-left">
          <p className="text-sm font-medium text-honey-25">
            {item.metadata.name}
          </p>
          <p className="text-sm text-night-400">#{item.tokenId}</p>
        </div>
        <a
          target="_blank"
          rel="noopener noreferrer"
          title={`View ${item.metadata.name} on Trove`}
          className="text-night-400 transition-colors hover:text-night-100"
          href={createTokenUrl(item.collectionUrlSlug, item.tokenId)}
          onClick={(e) => e.stopPropagation()}
        >
          <InfoIcon className="h-4 w-4" />
          <span className="sr-only">View {item.metadata.name} on Trove</span>
        </a>
      </div>
    </div>
  );

  if (viewOnly) {
    return (
      <div className="overflow-hidden rounded-lg bg-night-900">{innerCard}</div>
    );
  }

  return (
    <button
      className={cn(
        "group relative overflow-hidden rounded-lg bg-night-900",
        selected && "ring-2 ring-night-100"
      )}
      onClick={onClick}
      disabled={disableUnselected}
    >
      {!disableUnselected ? (
        <span className="sr-only">Select {item.metadata.name}</span>
      ) : null}
      {innerCard}
    </button>
  );
};

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
        <XIcon className="h-2 w-2" />
      </button>
    </span>
  );
};

type BaseProps = {
  token?: PoolToken;
  type: "vault" | "inventory";
};

type ViewOnlyProps = BaseProps & {
  viewOnly: true;
};

type EditableProps = BaseProps & {
  viewOnly?: false;
  selectedTokens?: TroveTokenWithQuantity[];
  limit?: number;
  onSubmit: (items: TroveTokenWithQuantity[]) => void;
};

type Props = ViewOnlyProps | EditableProps;

export const SelectionPopup = ({ token, type, ...props }: Props) => {
  const [selectedItems, setSelectedItems] = useState<TroveTokenWithQuantity[]>(
    !props.viewOnly ? props.selectedTokens ?? [] : []
  );
  const fetcher = useFetcher<CollectionLoader>();
  const filterFetcher = useFetcher<TroveFilters>();
  const { load, Form, submit, formData, state, data } = fetcher;
  const { load: loadFilters } = filterFetcher;
  const { address } = useAccount();
  const traitInfoRef = React.useRef<string>("");
  const queryFormRef = React.useRef<HTMLFormElement>(null);

  const id = token?.id;
  const fetchFromVault = type === "vault";
  const offsetRef = React.useRef(0);

  const totalQuantity = selectedItems.reduce(
    (acc, curr) => (acc += curr.quantity),
    0
  );

  const selectionDisabled =
    !props.viewOnly && props.limit ? totalQuantity >= props.limit : false;
  const buttonDisabled =
    !props.viewOnly && props.limit
      ? totalQuantity > props.limit
      : selectedItems.length === 0
      ? true
      : false;

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
    if (!address || !token?.isNFT) {
      return;
    }

    const params = new URLSearchParams({
      slug: token.urlSlug,
    });

    if (fetchFromVault && id) {
      params.set("type", "vault");
      params.set("id", id);
    } else {
      params.set("type", "inventory");
      params.set("address", address);
    }

    if (traitInfoRef.current.length > 0) {
      params.set("traits", traitInfoRef.current);
    }
    load(`/resources/get-collection/?${params.toString()}`);
  }, [address, fetchFromVault, load, token?.isNFT, token?.urlSlug, id]);

  React.useEffect(() => {
    if (!token?.isNFT) {
      return;
    }
    fetchCollection();
    loadFilters(`/resources/get-filters/${token.urlSlug}`);
  }, [token?.isNFT, token?.urlSlug, loadFilters, fetchCollection]);

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
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="address" value={address} />
      <input type="hidden" name="slug" value={token.urlSlug} />
    </>
  );

  return (
    <DialogContent
      className={cn(
        "h-full [grid-template-rows:auto_auto_1fr_1fr_25%] sm:max-w-8xl",
        !props.viewOnly
          ? "grid-areas-nft-modal-mobile lg:grid-areas-nft-modal lg:[grid-template-columns:repeat(4,1fr)_25%]"
          : "grid-areas-nft-modal-viewonly"
      )}
    >
      <div className="flex items-center gap-2 grid-in-header">
        <p className="text-md text-night-400">
          {props.viewOnly ? "View" : "Select"}
        </p>
        <PoolTokenImage className="h-6 w-6" token={token} />
        <p className="text-md font-medium capitalize text-night-100">
          {token.name}{" "}
          <span className="normal-case text-night-400">
            from {fetchFromVault ? "the Vault" : "your Inventory"}
          </span>
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

              offsetRef.current = 0;
            }}
            onSubmit={(e) => e.preventDefault()}
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

            offsetRef.current = 0;
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

            offsetRef.current = 0;
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
              {data.tokens.tokens.map((item) => (
                <ItemCard
                  disabled={selectionDisabled}
                  selected={selectedItems.some(
                    (i) => i.tokenId === item.tokenId
                  )}
                  key={item.tokenId}
                  item={item}
                  viewOnly={props.viewOnly || false}
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
        <div className="flex justify-between bg-night-1000 p-3">
          <Form
            action="/resources/get-collection"
            method="get"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              offsetRef.current -= ITEMS_PER_PAGE;
              formData.set("offset", offsetRef.current.toString());
              submit(formData, {
                replace: true,
                method: "get",
                action: "/resources/get-collection",
              });
            }}
          >
            {HiddenInputs}
            {data?.traits && data?.traits.length > 0 && (
              <input
                type="hidden"
                name="traits"
                value={data.traits.join(",")}
              />
            )}
            {data?.query && (
              <input type="hidden" name="query" value={data.query} />
            )}

            <Button variant="secondary" disabled={offsetRef.current === 0}>
              Previous
            </Button>
          </Form>
          <Form
            action="/resources/get-collection"
            method="get"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              offsetRef.current += ITEMS_PER_PAGE;
              formData.set("offset", offsetRef.current.toString());
              submit(formData, {
                replace: true,
                method: "get",
                action: "/resources/get-collection",
              });
            }}
          >
            {HiddenInputs}
            {data?.tokens.nextPageKey && (
              <input
                type="hidden"
                name="nextPageKey"
                value={data.tokens.nextPageKey}
              />
            )}
            {data?.traits && data?.traits.length > 0 && (
              <input
                type="hidden"
                name="traits"
                value={data.traits.join(",")}
              />
            )}
            {data?.query && (
              <input type="hidden" name="query" value={data.query} />
            )}
            <Button
              variant="secondary"
              type="submit"
              disabled={
                !data?.tokens.nextPageKey ||
                // sometimes the next page key is there but the next page is empty
                data.tokens.tokens.length < ITEMS_PER_PAGE
              }
            >
              Next
            </Button>
          </Form>
        </div>
      </div>
      {!props.viewOnly && (
        <div className="flex flex-col gap-4 rounded-lg bg-night-1100 p-3 grid-in-selection">
          <div className="flex min-h-full flex-col">
            <p className="text-sm leading-[160%] text-night-400">
              Selected assets
            </p>
            {selectedItems.length > 0 ? (
              <div className="mt-2 flex flex-1 flex-col gap-2 overflow-auto pr-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {selectedItems.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex w-full items-center justify-between space-x-2 rounded-lg bg-night-900 p-2"
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
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm font-medium text-honey-25">
                            {item.metadata.name}
                          </p>
                          <p className="text-sm text-night-400">
                            #{item.tokenId}
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
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => selectionHandler(item)}
                        >
                          <XIcon className="w-4 text-night-400" />
                        </Button>
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
            <div className="sticky bottom-0 mt-2 space-y-3 bg-night-1100/50 backdrop-blur-sm">
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
                    disabled={buttonDisabled}
                    size="md"
                    onClick={() => props.onSubmit(selectedItems)}
                  >
                    {props.limit && buttonDisabled
                      ? `Remove ${totalQuantity - props.limit} Item${
                          totalQuantity - props.limit > 1 ? "s" : ""
                        }`
                      : "Save selections"}
                  </Button>
                </Close>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
};
