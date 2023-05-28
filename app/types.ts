import type { getPairsQuery } from ".graphclient";

/** Environment and helpers */
export type EnvVar =
  | "PUBLIC_ALCHEMY_KEY"
  | "PUBLIC_NODE_ENV"
  | "PUBLIC_ENABLE_TESTNETS"
  | "MAGICSWAPV2_API_URL"
  | "TROVE_API_URL"
  | "TROVE_API_NETWORK"
  | "PUBLIC_WALLET_CONNECT_KEY"
  | "DEFAULT_TOKEN_ADDRESS";

export type Env = {
  [key in EnvVar]: string;
};

export type Optional<T> = T | undefined;

export type AddressString = `0x${string}`;
export type NumberString = `${number}`;

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
  numTokensOwnedByUser: number;
  tokenDisplayName: {
    singular: string;
    plural: string;
  };
};

export type TroveCollectionMapping = Record<string, TroveCollection>;

type BasicTroveToken = {
  collectionAddr: string;
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
};

type TroveTokenERC721 = BasicTroveToken & {
  contractType: "ERC721";
};

type TroveTokenERC1155 = BasicTroveToken & {
  contractType: "ERC1155";
  queryUserQuantityOwned?: number;
};

export type TroveToken = TroveTokenERC721 | TroveTokenERC1155;

export type TroveTokenWithQuantity = TroveToken & {
  quantity: number;
};

export type TroveTokenMapping = Record<string, Record<string, TroveToken>>;

export type TroveApiResponse = {
  tokens: TroveToken[];
  nextPageKey: string | null;
};

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
