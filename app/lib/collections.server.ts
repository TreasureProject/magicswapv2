import type {
  Collection,
  PoolTokenCollection,
  TroveCollectionMapping,
} from "~/types";

export const createPoolTokenCollection = (
  collection: Collection,
  tokenIds: string[],
  collections: TroveCollectionMapping
): PoolTokenCollection => {
  const collectionData = collections[collection.id];
  return {
    id: collection.id,
    urlSlug: collectionData?.urlSlug ?? "",
    tokenIds,
    name: collectionData?.displayName ?? collection.id,
    symbol: collectionData?.symbol ?? "?",
    type: collectionData?.contractType ?? "ERC721",
    image: collectionData?.thumbnailUri ?? "",
  };
};
