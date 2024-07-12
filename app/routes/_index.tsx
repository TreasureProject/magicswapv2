import type { MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { ChevronRight as ChevronRightIcon } from "lucide-react";

import { Button } from "~/components/ui/Button";
import { generateUrl, getSocialMetas } from "~/lib/seo";
import type { RootLoader } from "~/root";

// export async function loader() {
//   const stats = await fetchStats();
//   return json({
//     stats,
//   });
// }

export const meta: MetaFunction<
  unknown, // typeof loader,
  {
    root: RootLoader;
  }
> = ({ matches, location }) => {
  const requestInfo = matches.find((match) => match.id === "root")?.data
    .requestInfo;
  return getSocialMetas({
    url: generateUrl(requestInfo?.origin, location.pathname),
    image: generateUrl(requestInfo?.origin, "/img/seo-banner.png"),
  });
};

export default function Homepage() {
  // const { stats } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="h-[548px] bg-[url(/img/home/hero.png)] bg-bottom bg-cover">
        <div className="mx-auto h-full max-w-lg space-y-8 text-center">
          <div className="space-y-3">
            <motion.h1
              initial={{
                opacity: 0,
                y: -30,
              }}
              animate={{
                opacity: 100,
                y: 0,
              }}
              className="font-bold text-4xl text-honey-25"
            >
              Magicswap Protocol
            </motion.h1>
            <motion.p
              className="text-night-300"
              initial={{
                opacity: 0,
                y: -30,
              }}
              animate={{
                opacity: 100,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
            >
              A decentralized trading protocol with universal token
              compatibility
            </motion.p>
          </div>
          <motion.div
            className="flex items-center justify-center gap-3"
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
      {/* <div className="-translate-y-1/4 md:-translate-y-1/2 container grid w-full grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
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
          <StatisticCard value={stats?.pairCount ?? 0} title="Trading Pairs" />
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
            delay: 0.25,
          }}
        >
          <StatisticCard value={stats?.userCount ?? 0} title="Traders" />
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
            value={formatNumber(stats?.reserveNFT ?? 0)}
            title="NFTs Supplied"
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
            delay: 0.35,
          }}
        >
          <StatisticCard value={stats?.txCount ?? 0} title="Transactions" />
        </motion.div>
      </div> */}
      <motion.div
        className="container mt-16 mb-16 flex flex-col items-center justify-between gap-8 md:mt-0 md:mb-0 md:h-[556px] md:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="gap-6 space-y-10 md:max-w-md">
          <div className="space-y-5">
            <h1 className="text-center font-semibold text-4xl text-honey-25 md:text-left">
              Universal Token Compatibility
            </h1>
            <p className="text-center text-night-500 text-xl md:text-left">
              Support pools for both ERC-20s and NFTs through a single router
              and enable trading of all items within game economies.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-night-500 text-xl transition-colors hover:text-night-100"
          >
            Learn more
            <ChevronRightIcon className="w-6" />
          </button>
        </div>
        <img src="/img/home/universal-token.png" alt="" className="h-full" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-6 rounded-xl bg-night-1100 p-8">
            <img src="/img/home/lp-rewards.svg" className="w-[42px]" alt="" />
            <div className="space-y-1">
              <h2 className="font-semibold text-2xl text-honey-25">
                Diverse LP rewards
              </h2>
              <p className="text-night-400">
                Issue NFTs, ERC20s, or both as liquidity incentives to your
                pool.
              </p>
            </div>
          </div>
          <div className="space-y-6 rounded-xl bg-night-1100 p-8">
            <img
              src="/img/home/automated-royalties.svg"
              className="w-[42px]"
              alt=""
            />
            <div className="space-y-1">
              <h2 className="font-semibold text-2xl text-honey-25">
                Automated royalties
              </h2>
              <p className="text-night-400">
                Magicswap pools utilize a three-tiered royalty system that
                includes fees for LPs, project creators, and the protocol.
              </p>
            </div>
          </div>
          <div className="space-y-6 rounded-xl bg-night-1100 p-8">
            <img
              src="/img/home/cheaper-trading.svg"
              className="w-[42px]"
              alt=""
            />
            <div className="space-y-1">
              <h2 className="font-semibold text-2xl text-honey-25">
                Cheaper trading
              </h2>
              <p className="text-night-400">
                Create ERC-721 collections that can be bought from the pool in
                any quantity with only one transaction cost.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative mt-8 flex flex-col gap-2 overflow-hidden rounded-xl bg-night-1100 p-8">
          <h1 className="relative z-10 font-semibold text-2xl text-honey-25">
            <span className="text-ruby-900 uppercase">$MAGIC</span> and Fee
            Structure
          </h1>
          <p className="relative z-10 max-w-3xl text-lg text-night-400">
            Magicswap utilizes $MAGIC as the governance and fee token. The
            protocol collects a 0.3% baseline fee for transactions that can be
            overridden by pool. Additional fees may be set by the pool creator
            and collected for projects and liquidity providers.
          </p>
          <img
            src="/img/home/magic.png"
            alt="Magic Illustration"
            className="absolute top-0 right-10 h-full"
          />
          <div className="absolute right-0 bottom-0 h-72 w-96 translate-y-3/4 rounded-full bg-ruby-900 opacity-20 blur-[999px]" />
        </div>
      </motion.div>
      <div className="relative mt-8 overflow-hidden border-t border-t-night-1000 py-8 md:mt-16 md:py-16">
        <div className="container">
          <div className="relative flex w-full flex-col justify-between gap-6 overflow-hidden rounded-lg border border-night-800 bg-night-1100 p-8 sm:flex-row sm:items-center">
            <div className="relative space-y-1">
              <h1 className="font-semibold text-2xl text-honey-25">
                Start trading today
              </h1>
              <p className="max-w-80 text-lg text-night-400">
                Explore our pools to trade your NFTs, tokens, and game assets!
              </p>
            </div>
            <Link to="/pools">
              <Button size="md" className="relative z-10">
                Explore Pools
              </Button>
            </Link>
            <img
              src="/img/home/collections.png"
              alt=""
              className="absolute top-0 right-28 h-full"
            />
          </div>
        </div>
      </div>
    </>
  );
}
