import type { MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";

import { Button } from "~/components/ui/Button";
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
    image: generateUrl(requestInfo?.origin, "/img/seo-banner.png"),
  });
};

export default function Page404() {
  return (
    <div className="h-[548px] bg-[url(/img/home/hero.png)] bg-bottom bg-cover">
      <div className="mx-auto h-full max-w-lg space-y-8">
        <div className="space-y-3">
          <h1 className="text-center font-bold text-4xl text-honey-25">
            Page Not Found
          </h1>
          <p className="text-center text-night-300">
            The path you have entered no longer exists or has never existed,
            perhaps you've made a mistake.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link to="/swap" prefetch="render">
            <Button className="w-full" size="lg">
              Start Trading
            </Button>
          </Link>
          <Link to="/pools" prefetch="render">
            <Button className="w-full" variant="secondary" size="lg">
              Add Liquidity
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
