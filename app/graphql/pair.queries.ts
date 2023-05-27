import gql from "graphql-tag";

import { TOKEN_FRAGMENT } from "./token.queries";

const TRANSACTION_ITEM_FRAGMENT = gql`
  fragment TransactionItemFragment on TransactionItem {
    id
    collection {
      id
    }
    tokenId
    amount
  }
`;

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
    reserveUSD
    totalSupply
    txCount
    volumeUSD
    lpFee
    protocolFee
    royaltiesFee
    royaltiesBeneficiary
    totalFee
    dayData(first: 7, orderBy: date, orderDirection: desc) {
      reserveUSD
      volumeUSD
      txCount
    }
  }
`;

export const getTransaction = gql`
  ${TRANSACTION_ITEM_FRAGMENT}
  query getTransaction($id: ID!) {
    transactions(orderBy: timestamp, orderDirection: desc) {
      id
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
      items0 {
        ...TransactionItemFragment
      }
      items1 {
        ...TransactionItemFragment
      }
    }
  }
`;

export const getPairs = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query getPairs {
    pairs(orderBy: volumeUSD, orderDirection: desc) {
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
