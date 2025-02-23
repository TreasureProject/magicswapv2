import { ChevronDownIcon } from "lucide-react";
import { Suspense } from "react";
import { Await, Link, Outlet, useMatches, useSearchParams } from "react-router";
import { fetchGames } from "~/api/games.server";

import { ChainFilter } from "~/components/ChainFilter";
import { MagicStarsIcon } from "~/components/ConnectButton";
import { GameFilter } from "~/components/GameFilter";
import { SearchFilter } from "~/components/SearchFilter";
import { Button } from "~/components/ui/Button";
import { generateTitle, generateUrl, getSocialMetas } from "~/lib/seo";
import { cn } from "~/lib/utils";
import type { RootLoaderData } from "~/root";
import type { Route } from "./+types/pools";

export type PoolsHandle = {
  tab: "pools" | "user";
};

export const meta: Route.MetaFunction = ({ matches, location }) => {
  const requestInfo = (
    matches.find((match) => match?.id === "root")?.data as
      | RootLoaderData
      | undefined
  )?.requestInfo;
  return getSocialMetas({
    url: generateUrl(requestInfo?.origin, location.pathname),
    title: generateTitle("Liquidity Pools"),
    image: generateUrl(requestInfo?.origin, "/img/seo-banner-pools.png"),
  });
};

export const loader = () => ({
  games: fetchGames(),
});

export default function PoolsListPage({
  loaderData: { games },
}: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const matches = useMatches();
  const match = matches[matches.length - 1];
  const tab = (match?.handle as PoolsHandle | undefined)?.tab ?? "pools";

  const handleSearch = (value: string) => {
    setSearchParams((curr) => {
      const currValue = curr.get("search");
      if (value || currValue !== null) {
        if (value) {
          curr.set("search", value);
        } else {
          curr.delete("search");
        }
      }

      return curr;
    });
  };

  const handleSelectGame = (id: string) => {
    setSearchParams((curr) => {
      if (!id || curr.get("game") === id) {
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

  const handleToggleIncentivized = () => {
    setSearchParams((curr) => {
      if (curr.get("incentivized") === "true") {
        curr.delete("incentivized");
      } else {
        curr.set("incentivized", "true");
      }
      return curr;
    });
  };

  const isMyPositions = match?.pathname === "/pools/my-positions";

  return (
    <main className="container space-y-8 py-5 md:py-7">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl">Pools</h1>
        <p className="text-silver-200">
          Use your game assets to earn rewards by providing liquidity.
        </p>
      </div>
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          <Link
            to="/pools"
            className={cn(
              "rounded-lg px-3 py-1 text-white hover:bg-night-400",
              tab === "pools" && "bg-night-500",
            )}
          >
            All Pools
          </Link>
          <Link
            to="/pools/my-positions"
            className={cn(
              "rounded-lg px-3 py-1 text-white hover:bg-night-400",
              tab === "user" && "bg-night-500",
            )}
          >
            My Positions
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchFilter
            defaultValue={searchParams.get("search") || undefined}
            onChange={handleSearch}
          />
          {!isMyPositions ? (
            <Suspense
              fallback={
                <Button
                  variant="secondary"
                  className="flex items-center gap-1.5 border border-night-500 bg-night-700"
                >
                  All Games
                  <ChevronDownIcon className="h-3.5 w-3.5 text-silver-600" />
                </Button>
              }
            >
              <Await resolve={games}>
                {(games) => (
                  <GameFilter
                    games={games}
                    selectedGameId={searchParams.get("game") || undefined}
                    onChange={handleSelectGame}
                    onClear={() => handleSelectGame("")}
                  />
                )}
              </Await>
            </Suspense>
          ) : null}
          <ChainFilter
            selectedChainId={
              searchParams.get("chain")
                ? Number(searchParams.get("chain"))
                : undefined
            }
            onChange={handleSelectChain}
            onClear={() => handleSelectChain(-1)}
          />
          {!isMyPositions ? (
            <Button
              variant="secondary"
              className={cn(
                "flex items-center gap-1.5 border border-night-500 bg-night-700",
                searchParams.get("incentivized") === "true" && "bg-night-400",
              )}
              onClick={() => handleToggleIncentivized()}
            >
              <MagicStarsIcon className="h-3.5 w-3.5 text-honey-400" />
              Incentivized
            </Button>
          ) : null}
          {searchParams.size > 0 && (
            <Button
              variant="link"
              className="text-primary-foreground"
              onClick={() => setSearchParams({})}
            >
              Reset
            </Button>
          )}
        </div>
        <Outlet />
      </div>
    </main>
  );
}
