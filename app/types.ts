import type { getPairsQuery } from ".graphclient";

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
  Token["vaultCollections"]
>[number]["collection"];

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

export type TroveToken = {
  collectionAddr: string;
  tokenId: string;
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
};

export type TroveTokenMapping = Record<string, Record<string, TroveToken>>;

// DeFiLlama
export type LlamaTokensResponse = {
  coins: Record<string, { price: number }>;
};

export type TokenPriceMapping = Record<string, number>;
