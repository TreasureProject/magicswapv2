import type { MetaFunction } from "@remix-run/react";
import { Link, Outlet, useMatches, useSearchParams } from "@remix-run/react";
import { ChainIcon } from "connectkit";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import type { Chain } from "viem";
import { useChainId, useChains } from "wagmi";
import { CheckIcon } from "~/components/Icons";
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

  const handleSelectNetwork = (id: string) => {
    setSearchParams((curr) => {
      if (!id) {
        curr.delete("network");
      } else if (curr.get("network") === id) {
        curr.delete("network");
      } else {
        curr.set("network", id);
      }

      return curr;
    });
  };

  const selectedChain = chains.find(
    (chain) => chain.id.toString() === searchParams.get("network"),
  );

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
          <div className="flex items-center rounded-md border border-night-800 pl-2">
            <SearchIcon className="h-5 w-5 text-night-400" />
            <Input
              type="search"
              placeholder="Search"
              className="w-auto border-none ring-offset-transparent focus-visible:ring-0 focus-visible:ring-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {Object.entries(GAME_METADATA).map(
            ([id, { name, image, tokens, collections }]) =>
              chainId in tokens || chainId in collections ? (
                <button
                  key={id}
                  type="button"
                  className={cn(
                    "flex items-center gap-1 rounded-full border border-night-800 px-3 py-2 text-sm transition-colors hover:bg-night-800 active:bg-night-900",
                    searchParams.get("game") === id && "bg-night-900",
                  )}
                  onClick={() => handleSelectGame(id)}
                >
                  <img src={image} alt="" className="h-5 w-5 rounded" />
                  {name}
                </button>
              ) : null,
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="space-x-1 border border-night-800 bg-transparent"
              >
                {selectedChain ? (
                  <>
                    <ChainIcon
                      id={selectedChain.id}
                      unsupported={false}
                      size="20px"
                    />
                    <span>{selectedChain.name}</span>
                  </>
                ) : (
                  <span>All networks</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="p-1">
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-full w-full items-center justify-start p-2"
                  onClick={() => handleSelectNetwork("")}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ChainIcon id={1} size="20px" unsupported={false} />
                      <span>All Networks</span>
                    </div>
                    {!selectedChain && <CheckIcon className="h-3 w-3" />}
                  </div>
                </Button>
              </DropdownMenuItem>
              {chains.map((chain) => (
                <DropdownMenuItem key={chain.id} className="p-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-full w-full items-center justify-start p-2"
                    onClick={() => handleSelectNetwork(chain.id.toString())}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ChainIcon
                          id={chain.id}
                          size="20px"
                          unsupported={false}
                        />
                        <span>{chain.name}</span>
                      </div>
                      {selectedChain?.id === chain.id && (
                        <CheckIcon className="h-3 w-3" />
                      )}
                    </div>
                  </Button>
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
