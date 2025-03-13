import { graphql } from "~/gql/query.server";
import { getContext } from "~/lib/context.server";
import { type PairFilter, PairFragment, pairToPool } from "./pools.server";
import { TokenFragment } from "./tokens.server";

export const getSwapQuery = graphql(
  `
  query getSwap(
    $pairWhere: pairFilter
    $pairLimit: Int = 100
    $pairOrderBy: String = "reserveUsd"
    $pairOrderDirection: String = "desc"
    $tokenInChainId: Float!
    $tokenInAddress: String!
    $hasTokenOut: Boolean!
    $tokenOutChainId: Float!
    $tokenOutAddress: String!
  ) {
    price(id: 1) {
      magicUsd
    }
    games(orderBy: "name", orderDirection: "asc") {
      items {
        id
        name
        image
      }
    }
    pairs(
      where: $pairWhere
      limit: $pairLimit
      orderBy: $pairOrderBy
      orderDirection: $pairOrderDirection
    ) @include(if: $hasTokenOut) {
      items {
        ...PairFragment
      }
    }
    tokenIn: token(chainId: $tokenInChainId, address: $tokenInAddress) {
      ...TokenFragment
    }
    tokenOut: token(chainId: $tokenOutChainId, address: $tokenOutAddress) @include(if: $hasTokenOut) {
      ...TokenFragment
    }
  }
`,
  [PairFragment, TokenFragment],
);

export const fetchSwapData = async ({
  pairWhere,
  tokenInChainId,
  tokenInAddress,
  tokenOutChainId,
  tokenOutAddress,
}: {
  pairWhere?: PairFilter;
  tokenInChainId: number;
  tokenInAddress: string;
  tokenOutChainId?: number;
  tokenOutAddress?: string;
}) => {
  const { graphClient } = getContext();
  const { price, games, pairs, tokenIn, tokenOut } = await graphClient.request(
    getSwapQuery,
    {
      pairWhere,
      tokenInChainId,
      tokenInAddress,
      hasTokenOut: !!tokenOutChainId && !!tokenOutAddress,
      tokenOutChainId: tokenOutChainId ?? -1,
      tokenOutAddress: tokenOutAddress ?? "",
    },
  );
  return {
    magicUsd: price?.magicUsd ?? 0,
    games: games.items ?? [],
    pools: pairs
      ? await Promise.all(
          pairs.items.map((pair) =>
            pairToPool(pair, { ignoreIncentives: true }),
          ) ?? [],
        )
      : [],
    tokenIn,
    tokenOut: tokenOut ?? undefined,
  };
};
