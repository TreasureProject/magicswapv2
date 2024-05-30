import type { GetPairsQuery } from ".graphclient";

export type Optional<T> = T | undefined;

export type AddressString = `0x${string}`;
export type NumberString = `${number}`;

/** Data Transfer Objects */
// Subgraph
export type Pair = GetPairsQuery["pairs"][number];
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
  symbol: string;
  numTokensOwnedByUser: number;
  // tokenDisplayName: {
  //   singular: string;
  //   plural: string;
  // };
};

export type TroveCollectionMapping = Record<string, TroveCollection>;

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

/** Magicswap Objects */
export type PoolTokenCollection = {
  id: string;
  urlSlug: string;
  tokenIds: string[];
  name: string;
  symbol: string;
  type: "ERC721" | "ERC1155";
  image: string;
};

export type PoolToken = Omit<Token, "decimals"> & {
  type?: "ERC721" | "ERC1155";
  decimals: number;
  image: string;
  isMAGIC: boolean;
  collections: PoolTokenCollection[],
  urlSlug: string;
  collectionId: string;
  collectionTokenIds: string[];
  priceUSD: number;
  reserve: string;
};
