import type { TroveCollection, TroveCollectionMapping } from "~/types";

const getTroveCollections = async (
  addresses: string[]
): Promise<TroveCollection[]> => {
  const url = new URL(`${process.env.TROVE_API_URL}/batch-collections`);

  url.searchParams.set(
    "slugs",
    addresses
      .map((address) => `${process.env.TROVE_API_NETWORK}/${address}`)
      .join(",")
  );

  const response = await fetch(url.toString());
  return response.json();
};

export const fetchTroveCollections = async (addresses: string[]) => {
  const collections = await getTroveCollections(addresses);

  return collections.reduce(
    (acc, collection) => ({
      ...acc,
      [collection.collectionAddr.toLowerCase()]: collection,
    }),
    {} as TroveCollectionMapping
  );
};
