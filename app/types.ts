import type { SetNonNullable, SetOptional, SetRequired } from "type-fest";

import type { CONTRACT_ADDRESSES } from "./consts";
import type { GetPairsQuery } from ".graphclient";

export type Optional<T> = T | undefined;

export type NumberString = `${number}`;
export type ChainId = keyof typeof CONTRACT_ADDRESSES;

/** Data Transfer Objects */
// Subgraph
type Pair = GetPairsQuery["pairs"]["items"][number];
export type Pool = SetRequired<
  SetNonNullable<
    SetOptional<Pair, "hourData" | "dayData">,
    "token0" | "token1"
  >,
  "token0" | "token1"
> & {
  volume24h0: number;
  volume24h1: number;
  volume24hUsd: number;
  volume1wUsd: number;
  apy: number;
};
export type Token = Pool["token0"];
export type TokenWithAmount = {
  name: string;
  image?: string | null;
  collectionAddress: string;
  tokenId: string;
  amount: number | string;
};

// Trove
export type TroveToken = {
  collectionAddr: string;
  contractType: "ERC721" | "ERC1155";
  tokenId: string;
  collectionUrlSlug: string;
  image: {
    uri: string;
  };
  metadata: {
    name: string;
    attributes: {
      value: string | number;
      trait_type: string;
      display_type?: string;
    }[];
  };
  queryUserQuantityOwned?: number;
};

export type AccountDomains = {
  address: string;
  pfp?: string | null;
  treasuretag?: {
    name: string;
    pfp: string | null;
    banner: string | null;
  };
};
