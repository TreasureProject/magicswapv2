import type { TroveCollection, TroveCollectionMapping } from "~/types";

export const fetchTroveCollection = async (
  address: string
): Promise<TroveCollection> => {
  const response = await fetch(
    `${process.env.TROVE_API_URL}/collection/${process.env.TROVE_API_NETWORK}/${address}`
  );
  return response.json();
};

export const fetchTroveCollections = async (addresses: string[]) => {
  const collections = await Promise.all(
    addresses.map((address) => fetchTroveCollection(address))
  );
  return collections.reduce(
    (acc, collection) => ({
      ...acc,
      [collection.collectionAddr.toLowerCase()]: collection,
    }),
    {} as TroveCollectionMapping
  );
};
