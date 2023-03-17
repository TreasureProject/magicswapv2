import type { getPairsQuery, NftType } from ".graphclient";

/** Environment and helpers */
export type EnvVar =
  | "PUBLIC_ALCHEMY_KEY"
  | "PUBLIC_NODE_ENV"
  | "PUBLIC_ENABLE_TESTNETS"
  | "EXCHANGE_ENDPOINT";

export type Env = {
  [key in EnvVar]: string;
};

export type Optional<T> = T | undefined;

/** Data Transfer Objects */
// Subgraph
export type Pair = getPairsQuery["pairs"][number];
export type Token = Pair["token0"];
export type Collection = NonNullable<
  Token["nftVault"]
>["nftVaultCollections"][number]["collection"];

// Trove
export type TroveCollection = {
  collectionAddr: string;
  contractType: "ERC721" | "ERC1155";
  displayName: string;
  thumbnailUri: string;
  tokenDisplayName: {
    singular: string;
    plural: string;
  };
};

export type TroveCollectionMapping = Record<string, TroveCollection>;

/** Application types */
export type PoolTokenCollection = {
  id: string;
  name: string;
  symbol: string;
  type: NftType;
  image: Optional<string>;
};

export type PoolToken = {
  id: string;
  name: string;
  image: Optional<string>;
  collections: PoolTokenCollection[];
  isNft: boolean;
};

export type Pool = {
  id: string;
  name: string;
  token0: PoolToken;
  token1: PoolToken;
};
