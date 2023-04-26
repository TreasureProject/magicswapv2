import { MagicLogo } from "@treasure-project/branding";
import { motion } from "framer-motion";
import {
  ChevronRight as ChevronRightIcon,
  PlayCircle as PlayIcon,
} from "lucide-react";
import React from "react";

import collectionsImage from "../assets/collections.png";
import magicIllustration from "../assets/magic_illustration.png";
import tokenGraphicImage from "../assets/token_graphic.png";
import {
  ChartIcon,
  ExchangeIcon,
  FlatMagicIcon,
  PoolIcon,
  RoyaltiesIcon,
  SweepIcon,
} from "~/assets/Svgs";
import InfoCard from "~/components/Landing/InfoCard";
import StatisticCard from "~/components/Landing/StatisticCard";
import { Button } from "~/components/ui/Button";

const landing = () => {
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
              The Gateway to the cross-game economy.
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
              Buy, Sell, Swap{" "}
              <span className="text-medium uppercase text-honey-800">any</span>{" "}
              token using MagicSwap’s AMM
            </motion.p>
          </div>
          <motion.div
            className="flex max-w-md gap-3 sm:w-full"
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
            <Button className="w-full" size="lg">
              Start Trading
            </Button>
            <Button className="w-full" variant="secondary" size="lg">
              Start Trading
            </Button>
          </motion.div>
          <motion.button
            className="flex items-center gap-2 py-2 text-sm font-medium leading-[160%] text-night-400 transition-colors hover:text-night-100"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.4,
            }}
          >
            Watch Tutorial
            <PlayIcon className="w-4 " />
          </motion.button>
        </div>
      </div>
      <div className="container grid w-full -translate-y-1/4 grid-cols-2 gap-3  md:-translate-y-1/2 md:grid-cols-4 md:gap-6">
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
            value="$2.00"
            title="Magic Price"
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
            value="4,530,000"
            title="TRADES"
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
            value="$500,000.00"
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
          <StatisticCard value="535.000" title="NFTs Supplied" />
        </motion.div>
      </div>
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
            Support pools for both ERC-20s and NFTs through a single router, and
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
          What makes magic swap special?
        </p>
        <div className="container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            Icon={RoyaltiesIcon}
            title="Automated Royalties"
            description="Automated royalties that can be set for each pool- a feature that is directly integrated into the pool creation progress."
            link="e"
          />
          <InfoCard
            Icon={PoolIcon}
            title="NFT:NFT Pools"
            description="MagicSwap allows projects to create pools that use an ERC-1155 as the base pair, a first for NFT AMMs."
            link="e"
          />
          <InfoCard
            Icon={SweepIcon}
            title="Sweeping"
            description="MagicSwap allows user to sweep any number of NFTs from the pools."
            link="e"
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
            MagicSwap utilizes{" "}
            <span className="font-medium uppercase text-night-100">$MAGIC</span>{" "}
            as the governance as well as fee token. The protocol will also
            collect the royalties currently in place on the Trove marketplace:{" "}
            <span className="font-medium text-honey-100">2.5% for the DAO</span>{" "}
            and a variable{" "}
            <span className="font-medium text-night-600">0-20%</span> for the
            project creator
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
            <Button size="md" className="relative z-10">
              Explore Pools
            </Button>
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
};

export default landing;
