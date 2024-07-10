import type { MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { ChevronRightIcon } from "lucide-react";

import { Grid, LearnIcon, PoolsIcon, SwapIcon } from "~/assets/Svgs";
import { Button } from "~/components/ui/Button";
import { DOCS_URL } from "~/consts";
import { generateTitle, generateUrl, getSocialMetas } from "~/lib/seo";
import type { RootLoader } from "~/root";

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
    title: generateTitle("Page Not Found"),
    image: generateUrl(requestInfo?.origin, "/img/default_banner.png"),
  });
};

export default function Page404() {
  return (
    <main className="container relative mx-auto px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <Grid className="-translate-x-1/2 absolute top-0 left-1/2 z-0 w-screen min-w-[1024px]" />
      <div className="relative z-10 flex w-full flex-col items-start gap-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex max-w-lg flex-col items-center gap-6 sm:items-start sm:gap-11">
          <h1 className="text-center font-bold text-4xl sm:text-start">
            This page can't be found
          </h1>
          <p className="text-center text-base-600 text-sm leading-[160%] sm:text-start sm:text-md">
            The path you have entered no longer exists or has never existed,
            perhaps you've made a mistake.
          </p>
          <Button size="md" className="w-max">
            Take me back
          </Button>
        </div>
        <div className="flex lg:w-full lg:justify-end">
          <div className="flex w-full max-w-md flex-col gap-6">
            <Link
              to="/swap"
              className="group flex w-full cursor-pointer items-center gap-6 rounded-lg bg-night-1100 p-4 transition-colors hover:bg-night-1000"
            >
              <SwapIcon className="w-10" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className="font-bold text-md sm:text-xl">Swap</h1>
                  <ChevronRightIcon className="w-5 text-night-400 transition-all group-hover:ml-1" />
                </div>
                <p className="tranistion-colors text-night-400 text-sm leading-[160%] group-hover:text-night-200">
                  Start trading your digital assets right now
                </p>
              </div>
            </Link>
            <Link
              to="/pools"
              className="group flex w-full cursor-pointer items-center gap-6 rounded-lg bg-night-1100 p-4 transition-colors hover:bg-night-1000"
            >
              <PoolsIcon className="w-10" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className="font-bold text-md sm:text-xl">View Pools</h1>
                  <ChevronRightIcon className="w-5 text-night-400 transition-all group-hover:ml-1" />
                </div>
                <p className="tranistion-colors text-night-400 text-sm leading-[160%] group-hover:text-night-200">
                  Start earning by providing liquidity to Magicswap
                </p>
              </div>
            </Link>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="group flex w-full cursor-pointer items-center gap-6 rounded-lg bg-night-1100 p-4 transition-colors hover:bg-night-1000"
            >
              <LearnIcon className="w-10" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className="font-bold text-md sm:text-xl">Learn More</h1>
                  <ChevronRightIcon className="w-5 text-night-400 transition-all group-hover:ml-1" />
                </div>
                <p className="tranistion-colors text-night-400 text-sm leading-[160%] group-hover:text-night-200">
                  Read more about how Magicswap Works
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
