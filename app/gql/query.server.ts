import { initGraphQLTada } from "gql.tada";

import type { introspection } from "./env.js";

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    BigInt: string;
    Bytes: string;
  };
}>();
