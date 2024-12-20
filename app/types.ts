import type { SetNonNullable, SetOptional, SetRequired } from "type-fest";
import type { GetPairsQuery } from ".graphclient";

export type Optional<T> = T | undefined;

export type AddressString = `0x${string}`;
export type NumberString = `${number}`;

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
  amount: number;
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

type DomainType = "ens" | "smol" | "treasuretag" | "address";

type DomainInfo = {
  name: string;
  pfp: string | null;
  banner: string | null;
};

export type AccountDomains = {
  address: string;
  ens?: DomainInfo;
  smol?: DomainInfo;
  treasuretag?: DomainInfo;
  preferredDomainType?: DomainType;
};
