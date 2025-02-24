import type { CONTRACT_ADDRESSES } from "./consts";

export type Optional<T> = T | undefined;

export type NumberString = `${number}`;
export type ChainId = keyof typeof CONTRACT_ADDRESSES;
export type Version = "V1" | "V2";

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
