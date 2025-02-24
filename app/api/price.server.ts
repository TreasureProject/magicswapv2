import { graphql } from "~/gql/query.server";
import { getContext } from "~/lib/env.server";

export const getMagicPriceQuery = graphql(`
  query getMagicPrice {
    price(id: 1) {
      magicUsd
    }
  }
`);

export const fetchMagicUsd = async () => {
  const { graphClient } = getContext();
  const { price } = await graphClient.request(getMagicPriceQuery);
  return price?.magicUsd ?? 0;
};
