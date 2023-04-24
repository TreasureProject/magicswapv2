import type { getPairsQuery } from ".graphclient";

/** Environment and helpers */
export type EnvVar =
  | "PUBLIC_ALCHEMY_KEY"
  | "PUBLIC_NODE_ENV"
  | "PUBLIC_ENABLE_TESTNETS"
  | "MAGICSWAPV2_API_URL"
  | "TROVE_API_URL"
  | "TROVE_API_NETWORK";

export type Env = {
  [key in EnvVar]: string;
};

export type Optional<T> = T | undefined;

export type AddressString = `0x${string}`;

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
  urlSlug: string;
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

type BaseTraitMetadata = {
  traitCount: number;
  valuesMap: Record<
    string | number,
    { valueCount: number; valuePriority?: number }
  >;
  display_order?: string;
  superTrait?: string;
  subTrait?: string;
};

type DefaultTraitMetadata = {
  display_type?: "default";
} & BaseTraitMetadata;

type NumericTraitMetadata = {
  display_type?: "numeric";
  valueMin: number;
  valueMax: number;
  traitCount: number;
  valueStep: number;
} & BaseTraitMetadata;

type PercentageTraitMetadata = {
  display_type?: "percentage";
} & BaseTraitMetadata;

export type TraitMetadata =
  | DefaultTraitMetadata
  | NumericTraitMetadata
  | PercentageTraitMetadata;

export type TraitsResponse = {
  traitsMap: Record<string, TraitMetadata>;
};

export type Traits = TraitMetadata & {
  traitName: string;
  values: { valueName: string; count: number }[];
};

// DeFiLlama
export type LlamaTokensResponse = {
  coins: Record<string, { price: number }>;
};

export type TokenPriceMapping = Record<string, number>;
