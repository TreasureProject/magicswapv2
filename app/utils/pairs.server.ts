import type { Pair } from "~/types";
import { getTokenCollectionAddresses } from "./tokens.server";

export const getPairCollectionAddresses = (pair: Pair) => [
  ...new Set([
    ...getTokenCollectionAddresses(pair.token0),
    ...getTokenCollectionAddresses(pair.token1),
  ]),
];
