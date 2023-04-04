import type {
  Collection,
  PoolTokenCollection,
  TroveCollectionMapping,
} from "~/types";

export const createPoolTokenCollection = (
  collection: Collection,
  collections: TroveCollectionMapping
): PoolTokenCollection => {
  const collectionData = collections[collection.id];
  return {
    id: collection.id,
    name: collectionData?.displayName ?? collection.id,
    symbol: collectionData?.tokenDisplayName.singular ?? "?",
    type: collectionData?.contractType ?? "ERC721",
    image: collectionData?.thumbnailUri,
  };
};