import gql from "graphql-tag";

import { TOKEN_FRAGMENT } from "./token.queries";

export const PAIR_FRAGMENT = gql`
  fragment PairFragment on Pair {
    id
    token0 {
      ...TokenFragment
    }
    token1 {
      ...TokenFragment
    }
    reserve0
    reserve1
    totalSupply
    txCount
    transactions(orderBy: timestamp, orderDirection: desc) {
      hash
      timestamp
      type
      user {
        id
      }
      amount0
      amount1
      amountUSD
      isAmount1Out
    }
  }
`;

export const getPairs = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query getPairs {
    pairs {
      ...PairFragment
    }
  }
`;

export const getPair = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query getPair($id: ID!) {
    pair(id: $id) {
      ...PairFragment
    }
  }
`;
