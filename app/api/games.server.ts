import { graphql } from "~/gql/query.server";
import { getContext } from "~/lib/env.server";

export const getGamesQuery = graphql(`
  query getGames {
    games(orderBy: "name", orderDirection: "asc") {
      items {
        id
        name
        image
      }
    }
  }
`);

export const fetchGames = async () => {
  const { graphClient } = getContext();
  const { games } = await graphClient.request(getGamesQuery);
  return games.items ?? [];
};
