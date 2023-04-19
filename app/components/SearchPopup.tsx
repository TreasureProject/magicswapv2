import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// To-Do
// Hover effect on cards
// Mobile responsive
// Animate on enter
// Map items to data
// Filter items based on search
// format numbers
//Temporary image imports
import etherCoinImage from "~/assets/ether.png";
import legionCardImage from "~/assets/genesis_legions_card.png";
import magicCoinImage from "~/assets/magic.png";
import smolCoinImage from "~/assets/smol.png";
import { SearchIcon, VerifiedIcon } from "~/components/Icons";
import Input from "~/components/Input";
import PopupOverlay from "~/components/PopupOverlay";
import { CloseButton } from "~/components/ui/Button";

interface TrendingProps {
  name: string;
  collection: string;
  link: string;
  token: string;
  price: number;
  items: number;
  image: string;
  popularPairs: {
    tokenOne: string;
    tokenOneImage: string;
    tokenTwo: string;
    tokenTwoImage: string;
  }[];
}

const exampleTrendingData: TrendingProps = {
  name: "Genesis Legions",
  collection: "Bridgeworld",
  link: "/",
  token: magicCoinImage,
  price: 999,
  items: 344,
  image: legionCardImage,
  popularPairs: [
    {
      tokenOne: "SMOL",
      tokenOneImage: smolCoinImage,
      tokenTwo: "ETH",
      tokenTwoImage: etherCoinImage,
    },
  ],
};

const TrendingBox = ({ data }: { data: TrendingProps }) => {
  return (
    <Link
      to={data.link}
      className="group flex w-full items-center justify-between rounded-lg bg-night-1100 p-4"
    >
      <div className="flex items-center gap-4 ">
        <img src={data.image} className="h-14 w-14" alt={data.name} />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-night-100">{data.name}</h1>
          <div className="flex items-center gap-1">
            <VerifiedIcon className="w-3.5 text-sapphire-500" />
            <p className="text-sm text-night-600">{data.collection}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <p className="font-sm text-night-500">Price</p>
          <div className="flex items-center gap-1">
            <img src={data.token} className="w-3.5" alt="Token Pair" />
            <p className="text-md font-night-100 font-medium">{data.price}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="font-sm text-night-500">Items</p>
          <p className="text-md font-night-100 font-medium">{data.items}</p>
        </div>
      </div>
    </Link>
  );
};

interface PopularPoolProps {
  tokenOne: {
    name: string;
    image: string;
  };
  tokenTwo: {
    name: string;
    image: string;
  };
  stats: {
    volume: number;
    apr: number;
    tvl: number;
    fees: number;
    percentage: number;
  };
  link: string;
}

const examplePoolData: PopularPoolProps = {
  tokenOne: {
    name: "SMOL",
    image: smolCoinImage,
  },
  tokenTwo: {
    name: "ETH",
    image: etherCoinImage,
  },
  stats: {
    volume: 582.52,
    apr: 9.52,
    tvl: 5.25,
    fees: 252,
    percentage: 0.3,
  },
  link: "/",
};

const PopularPool = ({ data }: { data: PopularPoolProps }) => {
  return (
    <Link
      to={data.link}
      className="flex w-full items-center justify-between border-t border-night-900 bg-night-1100 px-6 py-3"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <img
            src={data.tokenOne.image}
            className="w-9 rounded-full"
            alt={data.tokenOne.name}
          />
          <img
            src={data.tokenTwo.image}
            className="border-outside -ml-4 w-9 rounded-full border-2 border-night-1100"
            alt={data.tokenTwo.name}
          />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-medium text-night-100">
            {data.tokenOne.name} <span className="text-night-600">/</span>{" "}
            {data.tokenTwo.name}
          </h1>
          <p className="text-md rounded-lg bg-night-800 px-2 py-1.5 font-medium text-night-400">
            {data.stats.percentage}%
          </p>
        </div>
      </div>
      <div className="flex w-full max-w-[360px]">
        <div className="flex w-1/3 justify-end">
          <p className="text-md font-medium text-night-100">
            {data.stats.volume}
          </p>
        </div>
        <div className="flex w-1/3 justify-end">
          <p className="text-md font-medium text-night-100">{data.stats.apr}</p>
        </div>
        <div className="flex w-1/3 justify-end">
          <p className="text-md font-medium text-night-100">{data.stats.tvl}</p>
        </div>
        <div className="flex w-1/3 justify-end">
          <p className="text-md font-medium text-night-100">
            {data.stats.fees}
          </p>
        </div>
      </div>
    </Link>
  );
};

interface SearchProps {
  onClose: () => void;
}

const SearchPopup = ({ onClose }: SearchProps) => {
  const [search, setSearch] = useState<string>("");

  const formHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    console.log(search);
  }, [search]);

  return (
    <PopupOverlay onClose={onClose}>
      <div className="z-[110]  w-full max-w-3xl flex-col">
        <div className="mb-5 flex items-center justify-between">
          <p className="font-medium text-night-100">Quick Search</p>
          <CloseButton onClick={onClose} />
        </div>
        <Input
          placeholder="Search name or paste address"
          className="mb-3 w-full"
          icon={<SearchIcon className="w-5" />}
          onChange={formHandler}
          value={search}
        />
        <div className="mb-4 w-full ">
          <p className="mb-2 text-night-500">Trending Collections</p>
          <div className="flex flex-col gap-1.5">
            <TrendingBox data={exampleTrendingData} />
            <TrendingBox data={exampleTrendingData} />
            <TrendingBox data={exampleTrendingData} />
            <TrendingBox data={exampleTrendingData} />
          </div>
        </div>
        <div className="w-full">
          <p className="mb-2 text-night-500">Trending Collections</p>
          <div className="flex flex-col overflow-hidden rounded-lg">
            <div className="flex w-full items-center justify-between bg-night-1100 px-6 py-3">
              <p className="text-md text-night-600">Name</p>
              <div className="flex w-full max-w-[360px]">
                <div className="flex w-1/3 justify-end">
                  <p className="text-md text-night-600">Volume(24h)</p>
                </div>
                <div className="flex w-1/3 justify-end">
                  <p className="text-md text-night-600">APR</p>
                </div>
                <div className="flex w-1/3 justify-end">
                  <p className="text-md text-night-600">TVL</p>
                </div>
                <div className="flex w-1/3 justify-end">
                  <p className="text-md text-night-600">Fees</p>
                </div>
              </div>
            </div>
            <PopularPool data={examplePoolData} />
            <PopularPool data={examplePoolData} />
            <PopularPool data={examplePoolData} />
          </div>
        </div>
      </div>
    </PopupOverlay>
  );
};

export default SearchPopup;
