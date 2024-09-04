import type { MetaFunction } from "@remix-run/react";
import { Link, Outlet, useMatches, useSearchParams } from "@remix-run/react";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

import { Input } from "~/components/ui/Input";
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
  const [, setSearchParams] = useSearchParams();
  const matches = useMatches();
  const match = matches[matches.length - 1];
  const tab = (match?.handle as PoolsHandle | undefined)?.tab ?? "pools";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
        <div className="flex items-center gap-2">
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
        </div>
        <Outlet />
      </div>
    </main>
  );
}
