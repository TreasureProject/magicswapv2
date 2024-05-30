import { useFetcher } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  TableIcon as ColumnIcon,
  ExternalLink,
  LayoutGridIcon as GridIcon,
  RotateCwIcon as RefreshIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import React, { useState } from "react";
import { useAccount } from "wagmi";

import { Badge } from "../Badge";
import { CheckIcon, FilledFilterIcon, LoaderIcon } from "../Icons";
import { PoolTokenImage } from "../pools/PoolTokenImage";
import { Button } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import IconToggle from "../ui/IconToggle";
import { NumberSelect } from "../ui/NumberSelect";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { DialogClose, DialogContent } from "~/components/ui/Dialog";
import { ITEMS_PER_PAGE } from "~/consts";
import { useTrove } from "~/hooks/useTrove";
import { countTokens, getTroveTokenQuantity } from "~/lib/tokens";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { CollectionLoader } from "~/routes/resources.collections.$slug";
import type { CollectionFiltersLoader } from "~/routes/resources.collections.$slug.filters";
import type { TroveToken, TroveTokenWithQuantity } from "~/types";

const ItemCard = ({
  selected,
  item,
  quantity,
  onClick,
  disabled,
  viewOnly,
  compact,
}: {
  selected: boolean;
  item: TroveToken;
  quantity: number;
  onClick: () => void;
  disabled: boolean;
  viewOnly: boolean;
  compact: boolean;
}) => {
  const { createTokenUrl } = useTrove();
  const disableUnselected = !selected && disabled;

  const innerCard = (
    <div className={cn("w-full", disableUnselected && "cursor-not-allowed opacity-30")}>
      {selected && (
        <div className="absolute right-2 top-2 z-20 flex h-4 w-4 items-center justify-center rounded-[3px] border-2 border-night-1200 bg-night-100 text-night-1200">
          <CheckIcon className="w-3" />
        </div>
      )}
      <div className="relative">
        <img
          src={item.image.uri}
          alt={item.tokenId}
          className={cn(
            "w-full",
            !viewOnly && !disableUnselected && "group-hover:opacity-75"
          )}
        />
        {quantity > 1 ? (
          <span className="absolute bottom-1.5 right-1.5 rounded-lg bg-night-700/80 px-2 py-0.5 text-xs font-bold text-night-100">
            {quantity}x
          </span>
        ) : null}
      </div>
      {!compact ? (
        <div className="flex items-start justify-between gap-2 p-2.5">
          <div className="text-left">
            <p className="text-xs font-medium text-honey-25 sm:text-sm">
              {item.metadata.name}
            </p>
            <p className="text-sm text-night-400">#{item.tokenId}</p>
          </div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            title={`View ${item.metadata.name} in the marketplace`}
            className="text-night-400 transition-colors hover:text-night-100"
            href={createTokenUrl(item.collectionUrlSlug, item.tokenId)}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">View {item.metadata.name} in the marketplace</span>
          </a>
        </div>
      ) : null}
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
        "group relative flex items-start overflow-hidden rounded-lg bg-night-900",
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
      className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg border-transparent bg-night-800 py-1 pl-3 pr-1 text-sm font-medium text-night-500"
    >
      <p>
        <span className="inline-block capitalize">{key}:</span>{" "}
        <span className="inline-block capitalize text-night-100">{value}</span>
      </p>
      <input type="hidden" name="deleteTrait" value={`${key}:${value}`} />
      <button
        type="submit"
        className="flex-shrink-0 rounded-md p-2 text-night-600 hover:bg-night-700 hover:text-night-200"
      >
        <span className="sr-only">Remove filter for {value}</span>
        <XIcon className="h-4 w-4" />
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
  children?: (renderProps: { amount: string }) => React.ReactNode;
};

type Props = ViewOnlyProps | EditableProps;

export const SelectionPopup = ({ token, type, ...props }: Props) => {
  const [selectedItems, setSelectedItems] = useState<TroveTokenWithQuantity[]>(
    !props.viewOnly ? props.selectedTokens ?? [] : []
  );
  const { load, Form, submit, formData, state, data } =
    useFetcher<CollectionLoader>();
  const {
    load: loadFilters,
    state: filtersState,
    data: filtersData,
  } = useFetcher<CollectionFiltersLoader>();
  const { address } = useAccount();
  const traitInfoRef = React.useRef<string>("");
  const queryFormRef = React.useRef<HTMLFormElement>(null);
  const offsetRef = React.useRef(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const collectionTokenIds = token?.collectionTokenIds.join(",");
  const ownerAddress = type === "vault" && token?.id ? token.id : address;
  const resourcePath = token?.isNFT
    ? `/resources/collections/${token.urlSlug}`
    : undefined;

  const totalQuantity = selectedItems.reduce(
    (acc, curr) => (acc += curr.quantity),
    0
  );

  const selectionDisabled =
    !props.viewOnly && props.limit ? totalQuantity >= props.limit : false;
  const buttonDisabled =
    !props.viewOnly && props.limit
      ? totalQuantity < props.limit
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
    if (!ownerAddress || !resourcePath) {
      return;
    }

    offsetRef.current = 0;

    const params = new URLSearchParams({
      address: ownerAddress,
    });

    if (collectionTokenIds) {
      params.set("tokenIds", collectionTokenIds);
    }

    if (traitInfoRef.current.length > 0) {
      params.set("traits", traitInfoRef.current);
    }

    load(`${resourcePath}?${params.toString()}`);
  }, [ownerAddress, load, resourcePath, collectionTokenIds]);

  React.useEffect(() => {
    if (!resourcePath) {
      return;
    }

    fetchCollection();
    loadFilters(`${resourcePath}/filters`);
  }, [resourcePath, loadFilters, fetchCollection]);

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

  const filteredList =
    filtersData && filtersData.ok ? filtersData.filterList : [];

  const filterWithValues = filteredList.filter((d) => d.values.length > 0);

  const traits = data && data.ok ? data.traits : [];

  const query = data && data.ok ? data.query : null;

  const tokens = data && data.ok ? data.tokens : null;

  const HiddenInputs = (
    <>
      <input type="hidden" name="address" value={ownerAddress} />
      <input type="hidden" name="tokenIds" value={collectionTokenIds} />
    </>
  );

  const loading = state === "loading" || state === "submitting";

  return (
    <DialogContent
      className={cn(
        "h-full [grid-template-rows:auto_auto_1fr_1fr_25%] sm:max-w-8xl",
        !props.viewOnly
          ? "grid-areas-nft-modal-mobile lg:grid-areas-nft-modal lg:[grid-template-columns:repeat(4,1fr)_25%]"
          : "grid-areas-nft-modal-viewonly"
      )}
    >
      <div className="flex items-center gap-2 text-xs grid-in-header sm:text-base">
        <p className="text-night-400">{props.viewOnly ? "View" : "Select"}</p>
        <PoolTokenImage className="h-6 w-6" token={token} />
        <p className="text-md font-medium capitalize text-night-100">
          {token.name}{" "}
          <span className="normal-case text-night-400">
            from {type === "vault" ? "the Vault" : "your Inventory"}
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
                action: resourcePath,
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
                id: "full",
                icon: GridIcon,
              },
              {
                id: "compact",
                icon: ColumnIcon,
              },
            ]}
            onChange={(id) => setIsCompactMode(id === "compact")}
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
              action: resourcePath,
            });

            offsetRef.current = 0;
          }}
          onSubmit={(e) => {
            // onSubmit is only called when a user removes a filter
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const targetTrait = formData.getAll("deleteTrait")[0];

            const filteredTraits =
              data && data.ok
                ? data?.traits.filter((t) => t !== targetTrait)
                : null;

            if (!filteredTraits) return;

            formData.set("traits", filteredTraits.join(","));

            submit(formData, {
              replace: true,
              action: resourcePath,
            });

            offsetRef.current = 0;
          }}
        >
          {HiddenInputs}
          <Popover onOpenChange={setIsFilterOpen}>
            <div className="flex space-x-2 divide-x divide-night-800 bg-night-1000 px-4 py-2">
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="group flex flex-shrink-0 items-center gap-2 text-sm font-medium text-honey-25"
                >
                  <FilledFilterIcon
                    className="h-4 w-4 text-night-100"
                    aria-hidden="true"
                  />
                  <span>Filters</span>
                  <Badge>{traits.length}</Badge>
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isFilterOpen && "-rotate-180"
                    )}
                  />
                </Button>
              </PopoverTrigger>
              <div className="flex w-full items-center gap-3 overflow-x-auto pl-2">
                {traits.map((trait) => (
                  <TraitFilterBadge trait={trait} key={trait} />
                ))}
              </div>
            </div>
            <PopoverContent
              align="start"
              className="h-96 overflow-auto sm:min-w-[45rem]"
            >
              {filtersState === "loading" ? (
                <div className="flex h-full items-center justify-center">
                  <LoaderIcon className="h-8 w-8 " />
                </div>
              ) : filtersState === "idle" && filteredList.length > 0 ? (
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
                            <legend className="text-sm font-medium text-honey-25">
                              {filter.traitName}
                            </legend>
                            <div className="space-y-2 pt-4">
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
                                        traits.includes(
                                          `${filter.traitName}:${value.valueName}`
                                        ) || false
                                      }
                                      value={`${filter.traitName}:${value.valueName}`}
                                    >
                                      <span className="cursor-pointer text-sm font-normal capitalize text-night-400">
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
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <LoaderIcon className="h-8 w-8" />
            </div>
          ) : state === "idle" && data && data.ok ? (
            <div
              className={cn(
                "grid gap-3",
                isCompactMode
                  ? "grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                  : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              )}
            >
              {data.tokens.tokens.map((item) => (
                <ItemCard
                  disabled={selectionDisabled}
                  selected={selectedItems.some(
                    (i) => i.tokenId === item.tokenId
                  )}
                  key={item.tokenId}
                  item={item}
                  quantity={getTroveTokenQuantity(item)}
                  viewOnly={props.viewOnly || false}
                  compact={isCompactMode}
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
            onSubmit={(e) => {
              e.preventDefault();

              const formData = new FormData(e.currentTarget);
              offsetRef.current -= ITEMS_PER_PAGE;
              formData.set("offset", offsetRef.current.toString());

              submit(formData, {
                replace: true,
                action: resourcePath,
              });
            }}
          >
            {HiddenInputs}
            {traits.length > 0 && (
              <input type="hidden" name="traits" value={traits.join(",")} />
            )}
            {query && <input type="hidden" name="query" value={query} />}

            <Button
              variant="ghost"
              className="pl-2 pr-3.5"
              disabled={offsetRef.current === 0 || loading}
            >
              <ChevronRightIcon className="w-4 rotate-180" />
              Previous
            </Button>
          </Form>
          <Form
            onSubmit={(e) => {
              e.preventDefault();

              const formData = new FormData(e.currentTarget);
              offsetRef.current += ITEMS_PER_PAGE;
              formData.set("offset", offsetRef.current.toString());

              submit(formData, {
                replace: true,
                action: resourcePath,
              });
            }}
          >
            {HiddenInputs}
            {tokens && tokens.nextPageKey && (
              <input
                type="hidden"
                name="nextPageKey"
                value={tokens.nextPageKey}
              />
            )}
            {traits.length > 0 && (
              <input type="hidden" name="traits" value={traits.join(",")} />
            )}
            {query && <input type="hidden" name="query" value={query} />}
            <Button
              variant="ghost"
              type="submit"
              className="pl-3.5 pr-2"
              disabled={
                loading ||
                !tokens?.nextPageKey ||
                // sometimes the next page key is there but the next page is empty
                tokens.tokens.length < ITEMS_PER_PAGE
              }
            >
              Next
              <ChevronRightIcon className="w-4" />
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
                            max={item.queryUserQuantityOwned || 1}
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
              <div className="flex rounded-lg bg-night-800 p-4">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="text-sm text-night-400">Total</span>
                  {!props.viewOnly &&
                    props.children &&
                    props.children({
                      amount: String(countTokens(selectedItems)),
                    })}
                </div>
                <Button
                  size="xs"
                  className="p-0 text-[#28A0F0] hover:bg-transparent hover:text-[#28A0F0]/90"
                  variant="ghost"
                  onClick={() => setSelectedItems([])}
                >
                  Clear
                </Button>
              </div>

              <DialogClose asChild>
                <Button
                  disabled={buttonDisabled}
                  size="md"
                  className="w-full"
                  onClick={() => props.onSubmit(selectedItems)}
                >
                  {props.limit && buttonDisabled
                    ? `Add ${props.limit - totalQuantity} Item${
                        props.limit - totalQuantity > 1 ? "s" : ""
                      }`
                    : "Save selections"}
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
};
