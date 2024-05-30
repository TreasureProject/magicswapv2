import type { TroveCollection, TroveCollectionMapping } from "~/types";

export const fetchTroveCollections = async (addresses: string[]) => {
  const url = new URL(`${process.env.TROVE_API_URL}/batch-collections`);
  url.searchParams.set(
    "slugs",
    addresses
      .map((address) => `${process.env.TROVE_API_NETWORK}/${address}`)
      .join(",")
  );

  const response = await fetch(url.toString(), {
    headers: {
      "X-API-Key": process.env.TROVE_API_KEY,
    },
  });
  const result = (await response.json()) as TroveCollection[];
  return result.reduce((acc, collection) => {
    acc[collection.collectionAddr.toLowerCase()] = collection;
    return acc;
  }, {} as TroveCollectionMapping);
};
