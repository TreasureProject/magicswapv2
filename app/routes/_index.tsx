import type { V2_MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import {
  ChevronRight as ChevronRightIcon,
  PlayCircle as PlayIcon,
} from "lucide-react";

import collectionsImage from "../assets/collections.png";
import magicIllustration from "../assets/magic_illustration.png";
import tokenGraphicImage from "../assets/token_graphic.png";
import { PoolIcon, RoyaltiesIcon, SweepIcon } from "~/assets/Svgs";
import InfoCard from "~/components/Landing/InfoCard";
import { Button } from "~/components/ui/Button";
import { getSocialMetas, getUrl } from "~/lib/seo";
import type { RootLoader } from "~/root";

// export async function loader() {
//   const stats = await fetchStats();
//   return json({
//     stats,
//   });
// }

export const meta: V2_MetaFunction<
  unknown, // typeof loader,
  {
    root: RootLoader;
  }
> = ({ matches }) => {
  const requestInfo = matches.find((match) => match.id === "root")?.data
    .requestInfo;

  const url = getUrl(requestInfo);

  return getSocialMetas({
    url,
    image: "/img/default_banner.png",
  });
};

export default function Homepage() {
  return (
    <div className="max-w-screen mb-24 overflow-x-hidden">
      <div className="ruby-glow h-[548px] w-screen border-b border-b-night-800">
        <div className="container flex h-full flex-col items-center justify-center gap-8">
          <div className="flex flex-col gap-3">
            <motion.h1
              initial={{
                opacity: 0,
                y: -30,
              }}
              animate={{
                opacity: 100,
                y: 0,
              }}
              className="max-w-lg text-center text-4xl font-bold leading-[120%] text-night-100"
            >
              The gateway to the cross-game economy.
            </motion.h1>
            <motion.p
              className="text-center text-night-300"
              initial={{
                opacity: 0,
                y: -30,
              }}
              animate={{
                opacity: 100,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
            >
              Buy, sell, swap{" "}
              <span className="text-medium text-honey-800">any</span> token type
              using Magicswap’s AMM
            </motion.p>
          </div>
          <motion.div
            className="flex max-w-md items-center justify-center gap-3 sm:w-full"
            initial={{
              opacity: 0,
              y: -30,
            }}
            animate={{
              opacity: 100,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
          >
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
          </motion.div>
        </div>
      </div>
      {/* <div className="container grid w-full -translate-y-1/4 grid-cols-2 gap-3  md:-translate-y-1/2 md:grid-cols-4 md:gap-6">
        <motion.div
          className="div"
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
        >
          <StatisticCard
            Icon={MagicLogo}
            value={formatUSD(stats.global?.magicUSD ?? 0)}
            title="MAGIC Price"
            Background={FlatMagicIcon}
          />
        </motion.div>
        <motion.div
          className="div"
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
        >
          <StatisticCard
            value={stats.global?.txCount ?? 0}
            title="Transactions"
            Background={ExchangeIcon}
          />
        </motion.div>
        <motion.div
          className="div"
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
        >
          <StatisticCard
            value={formatUSD(stats.day?.volumeUSD ?? 0)}
            title="Volume Today"
            Background={ChartIcon}
          />
        </motion.div>
        <motion.div
          className="div"
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.4,
          }}
        >
          <StatisticCard
            value={formatNumber(stats.global?.reserveNFT ?? 0)}
            title="NFTs Supplied"
          />
        </motion.div>
      </div> */}
      <motion.div
        className="container mb-16 flex flex-col items-center justify-between gap-8 md:mb-0 md:h-[556px] md:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col items-center gap-6 md:max-w-md md:items-start">
          <h1 className="text-center text-3xl font-bold leading-[160%] text-night-100  md:text-start">
            Universal Token Compatibility
          </h1>
          <p className="text-md max-w-[80%] text-center leading-[160%] text-night-500 md:max-w-none md:text-start  lg:text-lg">
            Support pools for both ERC-20s and NFTs through a single router and
            enable trading of all items within game economies.
          </p>
          <button className="flex  items-center gap-2 text-night-500 transition-colors hover:text-night-100 ">
            Learn more
            <ChevronRightIcon className="w-5" />
          </button>
        </div>
        <div className="flex w-full items-center justify-center">
          <img
            src={tokenGraphicImage}
            alt="illustration of trading items on magicswap"
            className="w-[460px] "
          />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="mb-8 w-full text-center text-xl font-medium leading-[120%] text-night-400">
          What makes Magicswap special?
        </p>
        <div className="container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            Icon={SweepIcon}
            title="Instant Trading"
            description="Effortlessly buy and sell various types of game items."
            link="/"
          />
          <InfoCard
            Icon={PoolIcon}
            title="Provide Liquidity"
            description="Deposit game items and earn rewards through trading fees."
            link="/"
          />
          <InfoCard
            Icon={RoyaltiesIcon}
            title="Automated Royalties"
            description="Magicswap pools utilize a three-tiered royalty system that includes fees for LPs, project creators, and the protocol."
            link="/"
          />
        </div>
      </motion.div>
      <motion.div
        className="container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative mt-8 flex flex-col gap-2 overflow-hidden rounded-xl bg-night-1100 p-8 ">
          <h1 className="relative z-10 text-3xl font-medium leading-[120%] text-night-100">
            Role of <span className="uppercase text-ruby-900">$MAGIC</span>
          </h1>
          <p className="text-md relative z-10 max-w-3xl leading-[160%] text-night-400 md:text-lg">
            Magicswap utilizes{" "}
            <span className="font-medium uppercase text-night-100">$MAGIC</span>{" "}
            as the governance and fee token. The protocol collects a{" "}
            <span className="font-medium text-honey-100">2.5% base fee</span>{" "}
            for transactions with additional fees for projects and LPs set by
            the pool creator.
          </p>
          <img
            src={magicIllustration}
            alt="Magic Illustration"
            className="absolute right-12 top-4  box-border hidden h-[316px] w-[316px] opacity-10 md:block lg:opacity-100"
          />
          <div className="absolute right-40 top-4 h-[490px] w-[490px] translate-x-1/2 rounded-full  bg-ruby-900 opacity-20 blur-[999px]" />
        </div>
      </motion.div>
      <div className=" relative mt-8 overflow-hidden border-t border-t-night-1000 py-8 md:mt-16 md:py-16">
        <div className="container">
          <div className="bordernight-800  relative flex w-full flex-col justify-between gap-6 overflow-hidden rounded-lg border bg-night-1100 p-6 sm:flex-row sm:items-center">
            <div className="gap-.5 relative z-10 flex flex-col">
              <h1 className="text-lg font-medium text-night-100">
                Start trading today
              </h1>
              <p className="max-w-[80%] text-sm text-night-400 sm:max-w-none ">
                Explore our huge library of pools and get your desired NFTs!
              </p>
            </div>
            <Link to="/pools">
              <Button size="md" className="relative z-10">
                Explore Pools
              </Button>
            </Link>
            <img
              src={collectionsImage}
              className="absolute left-1/4 top-1/2 w-[420px] -translate-y-1/2 opacity-25 sm:left-1/2 sm:w-64  md:opacity-100"
              alt="Different collections on magicswap"
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 h-32 w-3/4 -translate-x-1/2 translate-y-1/2 rounded-full bg-night-700 opacity-20 blur-[300px]"></div>
      </div>
    </div>
  );
}
