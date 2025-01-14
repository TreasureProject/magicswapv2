import type { MetaFunction } from "@remix-run/react";
import {
  Link,
  Outlet,
  useLoaderData,
  useMatches,
  useSearchParams,
} from "@remix-run/react";
import { fetchGames } from "~/api/games.server";

import { ChainFilter } from "~/components/ChainFilter";
import { MagicStarsIcon } from "~/components/ConnectButton";
import { GameFilter } from "~/components/GameFilter";
import { SearchFilter } from "~/components/SearchFilter";
import { Button } from "~/components/ui/Button";
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

export async function loader() {
  return {
    games: await fetchGames(),
  };
}

export default function PoolsListPage() {
  const { games } = useLoaderData<typeof loader>();
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
          <SearchFilter onChange={handleSearch} />
          {!isMyPositions ? (
            <GameFilter
              games={games}
              selectedGameId={searchParams.get("game") || undefined}
              onChange={handleSelectGame}
              onClear={() => handleSelectGame("")}
            />
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
                "flex items-center gap-1.5 border border-night-900 bg-night-1100",
                searchParams.get("incentivized") === "true" && "bg-night-800",
              )}
              onClick={() => handleToggleIncentivized()}
            >
              <MagicStarsIcon className="h-3.5 w-3.5 text-honey-700" />
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
