import { fetchTroveTokenMapping } from "./tokens.server";
import type { Token, TroveCollection, TroveCollectionMapping } from "~/types";

const fetchCollections = async (addresses: string[]) => {
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

export const fetchTokensCollections = async (tokens: Token[]) => {
  const addresses = [
    ...new Set(
      tokens.flatMap(({ vaultCollections }) =>
        vaultCollections.map(({ collection }) => collection.id)
      )
    ),
  ];

  const tokenIds = [
    ...new Set(
      tokens.flatMap(({ vaultCollections }) =>
        vaultCollections.flatMap(
          ({ collection: { id: address }, tokenIds }) =>
            tokenIds?.map((tokenId) => `${address}/${tokenId}`) ?? []
        )
      )
    ),
  ];

  return Promise.all([
    fetchCollections(addresses),
    fetchTroveTokenMapping(tokenIds),
  ]);
};
