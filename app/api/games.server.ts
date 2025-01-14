import type { ExecutionResult } from "graphql";

import { GetGamesDocument, type GetGamesQuery, execute } from ".graphclient";

export const fetchGames = async () => {
  const { data, errors } = (await execute(
    GetGamesDocument,
    {},
  )) as ExecutionResult<GetGamesQuery>;
  if (errors) {
    throw new Error(
      `Error fetching games: ${errors
        .map((error) => error.message)
        .join(", ")}`,
    );
  }

  return data?.games.items ?? [];
};
