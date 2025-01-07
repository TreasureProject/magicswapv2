import type { MetaFunction } from "@remix-run/react";
import { Link, Outlet, useMatches, useSearchParams } from "@remix-run/react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { useChainId, useChains } from "wagmi";
import { ChainIcon } from "~/components/ChainIcon";

import { Button } from "~/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/Dropdown";
import { Input } from "~/components/ui/Input";
import { GAME_METADATA } from "~/consts";
import { generateTitle, generateUrl, getSocialMetas } from "~/lib/seo";
import { cn } from "~/lib/utils";
import type { RootLoader } from "~/root";

export type PoolsHandle = {
  tab: "pools" | "user";
};

export const meta: MetaFunction<
  unknown,
  {
    root: RootLoader;
  }
> = ({ matches, location }) => {
  const requestInfo = matches.find((match) => match.id === "root")?.data
    .requestInfo;
  return getSocialMetas({
    url: generateUrl(requestInfo?.origin, location.pathname),
    title: generateTitle("Liquidity Pools"),
    image: generateUrl(requestInfo?.origin, "/img/seo-banner-pools.png"),
  });
};

export default function PoolsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const matches = useMatches();
  const match = matches[matches.length - 1];
  const tab = (match?.handle as PoolsHandle | undefined)?.tab ?? "pools";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const chainId = useChainId();
  const chains = useChains();

  useDebounce(
    () => {
      setDebouncedSearch(search);
    },
    500,
    [search],
  );

  useEffect(() => {
    setSearchParams((curr) => {
      const currSearch = curr.get("search");
      if (debouncedSearch || currSearch !== null) {
        if (debouncedSearch) {
          curr.set("search", debouncedSearch);
        } else {
          curr.delete("search");
        }
      }

      return curr;
    });
  }, [debouncedSearch, setSearchParams]);

  const handleSelectGame = (id: string) => {
    setSearchParams((curr) => {
      if (curr.get("game") === id) {
        curr.delete("game");
      } else {
        curr.set("game", id);
      }

      return curr;
    });
  };

  const handleSelectChain = (chainId: number) => {
    setSearchParams((curr) => {
      if (chainId === -1) {
        curr.delete("chain");
      } else {
        curr.set("chain", chainId.toString());
      }

      return curr;
    });
  };

  const filterChainId = searchParams.get("chain")
    ? Number(searchParams.get("chain"))
    : undefined;
  const filterChain = filterChainId
    ? chains.find((chain) => chain.id === filterChainId)
    : undefined;

  const filterGame = GAME_METADATA[searchParams.get("game") || ""];

  return (
    <main className="container space-y-8 py-5 md:py-7">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl">Pools</h1>
        <p className="text-night-200">
          Use your game assets to earn rewards by providing liquidity.
        </p>
      </div>
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          <Link
            to="/pools"
            className={cn(
              "rounded-lg px-3 py-1 text-white hover:bg-night-800",
              tab === "pools" && "bg-night-900",
            )}
          >
            All Pools
          </Link>
          <Link
            to="/pools/my-positions"
            className={cn(
              "rounded-lg px-3 py-1 text-white hover:bg-night-800",
              tab === "user" && "bg-night-900",
            )}
          >
            My Positions
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-md border border-night-900 bg-night-1100 pl-2">
            <SearchIcon className="h-5 w-5 text-night-500" />
            <Input
              type="search"
              placeholder="Search"
              className="h-9 w-auto border-none ring-offset-transparent focus-visible:ring-0 focus-visible:ring-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-1.5 border border-night-900 bg-night-1100"
              >
                {filterGame ? (
                  <>
                    <img
                      src={filterGame.image}
                      alt=""
                      className="h-5 w-5 rounded"
                    />
                    {filterGame.name}
                  </>
                ) : (
                  "All Games"
                )}
                <ChevronDownIcon className="h-3.5 w-3.5 text-night-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 font-medium text-white"
                  onClick={() => handleSelectGame("")}
                >
                  All Games
                  {!filterGame ? <CheckIcon className="h-4 w-4" /> : null}
                </button>
              </DropdownMenuItem>
              {Object.entries(GAME_METADATA)
                .filter(
                  ([_id, { tokens, collections }]) =>
                    chainId in tokens || chainId in collections,
                )
                .map(([id, { name, image }]) => (
                  <DropdownMenuItem key={id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 font-medium text-white"
                      onClick={() => handleSelectGame(id)}
                    >
                      <span className="flex items-center gap-2">
                        <img src={image} alt="" className="h-5 w-5 rounded" />
                        {name}
                      </span>
                      {id === searchParams.get("game") ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : null}
                    </button>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-1.5 border border-night-900 bg-night-1100"
              >
                {filterChain ? (
                  <>
                    <ChainIcon chainId={filterChain.id} />
                    {filterChain.name}
                  </>
                ) : (
                  "All Networks"
                )}
                <ChevronDownIcon className="h-3.5 w-3.5 text-night-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 font-medium text-white"
                  onClick={() => handleSelectChain(-1)}
                >
                  All Networks
                  {!filterChain ? <CheckIcon className="h-4 w-4" /> : null}
                </button>
              </DropdownMenuItem>
              {chains.map((chain) => (
                <DropdownMenuItem key={chain.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 font-medium text-white"
                    onClick={() => handleSelectChain(chain.id)}
                  >
                    <span className="flex items-center gap-2">
                      <ChainIcon chainId={chain.id} />
                      {chain.name}
                    </span>
                    {chain.id === filterChain?.id ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : null}
                  </button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Outlet />
      </div>
    </main>
  );
}
