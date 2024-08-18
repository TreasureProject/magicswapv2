import gql from "graphql-tag";

import { PAIR_FRAGMENT } from "./pair.queries";
import { TOKEN_FRAGMENT } from "./token.queries";

export const getUserPositions = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetUserPositions(
    $id: ID!
    $skip: Int = 0
    $first: Int = 100
    $where: LiquidityPosition_filter
    $orderBy: LiquidityPosition_orderBy = balance
    $orderDirection: OrderDirection = desc
  ) {
    user(id: $id) {
      liquidityPositionCount
      liquidityPositions(
        first: $first
        skip: $skip
        where: $where
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
        pair {
          ...PairFragment
        }
        balance
      }
    }
  }
`;
