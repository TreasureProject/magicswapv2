import { GAME_METADATA } from "~/consts";
import { ENV } from "./env.server";

const getTokenIdsForGame = (id: string) =>
  GAME_METADATA[id]?.tokens[ENV.PUBLIC_CHAIN_ID] ?? [];

export const getTokenIdsMapForGame = (id: string) =>
  getTokenIdsForGame(id).reduce(
    (acc, id) => {
      acc[id] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );

const getCollectionIdsForGame = (id: string) =>
  GAME_METADATA[id]?.collections[ENV.PUBLIC_CHAIN_ID] ?? [];

export const getCollectionIdsMapForGame = (id: string) =>
  getCollectionIdsForGame(id).reduce(
    (acc, id) => {
      acc[id] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );
