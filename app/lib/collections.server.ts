import type {
  Collection,
  PoolTokenCollection,
  TroveCollectionMapping,
} from "~/types";

export const createPoolTokenCollection = (
  collection: Collection,
  tokenIds: string[],
  collectionMapping: TroveCollectionMapping,
): PoolTokenCollection => {
  const {
    urlSlug = "",
    displayName: name = collection.id,
    symbol = "?",
    contractType: type = "ERC721",
    thumbnailUri: image = "",
  } = collectionMapping[collection.id] ?? {};
  return {
    id: collection.id,
    urlSlug,
    tokenIds,
    name,
    symbol,
    type,
    image,
  };
};
