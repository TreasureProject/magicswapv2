import type { Collection, TroveCollectionMapping } from "~/types";

export const createPoolTokenCollection = (
  collection: Collection,
  collections: TroveCollectionMapping
) => {
  const collectionData = collections[collection.id];
  return {
    id: collection.id,
    urlSlug: collectionData?.urlSlug ?? "",
    name: collectionData?.displayName ?? collection.id,
    symbol: collectionData?.tokenDisplayName.singular ?? "?",
    type: collectionData?.contractType ?? "ERC721",
    image: collectionData?.thumbnailUri ?? "",
  };
};
