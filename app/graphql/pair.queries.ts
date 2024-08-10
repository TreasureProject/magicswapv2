import gql from "graphql-tag";

import { TOKEN_FRAGMENT } from "./token.queries";

const TRANSACTION_ITEM_FRAGMENT = gql`
  fragment TransactionItemFragment on TransactionItem {
    id
    vault {
      id
    }
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
    volume0
    volume1
    volumeUSD
    lpFee
    protocolFee
    royaltiesFee
    royaltiesBeneficiary
    totalFee
    dayData(first: 7, orderBy: date, orderDirection: desc) {
      date
      reserve0
      reserve1
      reserveUSD
      volume0
      volume1
      volumeUSD
      txCount
    }
  }
`;

export const getPairTransactions = gql`
  ${TRANSACTION_ITEM_FRAGMENT}
  query GetPairTransactions(
    $pair: ID!
    $skip: Int = 0
    $first: Int = 15
    $where: Transaction_filter
    $orderBy: Transaction_orderBy = timestamp
    $orderDirection: OrderDirection = desc
  ) {
    pair(id: $pair) {
      token0 {
        id
      }
      token1 {
        id
      }
      transactions(
        skip: $skip
        first: $first
        where: $where
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
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
        items {
          ...TransactionItemFragment
        }
      }
    }
  }
`;

export const getPairs = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetPairs(
    $skip: Int = 0
    $first: Int = 100
    $where: Pair_filter = { reserve0_gt: 0 }
    $orderBy: Pair_orderBy = reserveUSD
    $orderDirection: OrderDirection = desc
  ) {
    pairs(
      skip: $skip
      first: $first
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ...PairFragment
    }
  }
`;

export const getPair = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetPair($id: ID!) {
    pair(id: $id) {
      ...PairFragment
    }
  }
`;
