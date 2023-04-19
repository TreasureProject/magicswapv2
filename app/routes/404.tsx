import { ChevronRight as ChevronRightIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

import { documentation } from "../consts";
import { Grid, LearnIcon, PoolsIcon, SwapIcon } from "~/assets/Svgs";
import { Button } from "~/components/ui/Button";

// import tile1Image from "../assets/tile_1.png";
// import tile2Image from "../assets/tile_2.png";
// import tile3Image from "../assets/tile_3.png";
// import tile4Image from "../assets/tile_4.png";

const Page404 = () => {
  return (
    <div className="relative w-full pt-14 sm:pt-[20vh] lg:pt-[25vh]">
      <Grid className="absolute left-1/2 top-0 z-0 w-screen min-w-[1024px] -translate-x-1/2" />
      <div className="relative z-10 flex w-full flex-col items-start gap-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex max-w-lg flex-col items-center gap-6 sm:items-start sm:gap-11">
          {/* need to think of nicer animation here, lower priority*/}
          {/* <img
            src={tile1Image}
            className="absolute -left-[128px] -top-[96px] w-[96px] rotate-45 rounded-md"
            alt="NFT"
          />
          <img
            src={tile4Image}
            className="absolute -left-[200px] -bottom-[96px] w-[120px] rotate-12 rounded-md"
            alt="NFT"
          />
          <img
            src={tile3Image}
            className="absolute w-[156px] -rotate-12 rounded-md xl:-right-[128px] xl:-bottom-[96px] 2xl:-right-[128px] 2xl:-bottom-[96px]"
            alt="NFT"
          /> */}

          <h1 className="text-center text-4xl font-bold sm:text-start">
            This page can't be found
          </h1>
          <p className="text-base-600 sm:text-md text-center text-sm leading-[160%] sm:text-start">
            The path you have entered no longer exists or has never existed,
            perhaps you’ve made a mistake.
          </p>
          <Button size="md" className="w-max">
            Take me back
          </Button>
        </div>
        <div className="flex lg:w-full lg:justify-center">
          <div className="flex w-full max-w-md flex-col gap-6">
            <Link
              to="/swap"
              className="group flex w-full cursor-pointer items-center gap-6 rounded-lg bg-night-1100 p-4 transition-colors hover:bg-night-1000"
            >
              <SwapIcon className="w-10" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className="text-md font-bold sm:text-xl">Swap</h1>
                  <ChevronRightIcon className="w-5 text-night-400 transition-all group-hover:ml-1" />
                </div>
                <p className="tranistion-colors text-sm leading-[160%] text-night-400 group-hover:text-night-200">
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
                  <h1 className="text-md font-bold sm:text-xl">View Pools</h1>
                  <ChevronRightIcon className="w-5 text-night-400 transition-all group-hover:ml-1" />
                </div>
                <p className="tranistion-colors text-sm leading-[160%] text-night-400 group-hover:text-night-200">
                  Start earning by providing liquidity to magic swap
                </p>
              </div>
            </Link>
            <a
              href={documentation.documentation}
              target="_blank"
              rel="noreferrer"
              className="group flex w-full cursor-pointer items-center gap-6 rounded-lg bg-night-1100 p-4 transition-colors hover:bg-night-1000"
            >
              <LearnIcon className="w-10" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h1 className="text-md font-bold sm:text-xl">Learn More</h1>
                  <ChevronRightIcon className="w-5 text-night-400 transition-all group-hover:ml-1" />
                </div>
                <p className="tranistion-colors text-sm leading-[160%] text-night-400 group-hover:text-night-200">
                  Read more about how Magic Swap Works
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page404;
