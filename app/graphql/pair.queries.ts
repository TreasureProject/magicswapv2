import gql from "graphql-tag";

import { TOKEN_FRAGMENT } from "./token.queries";

const TRANSACTION_ITEM_FRAGMENT = gql`
  fragment TransactionItemFragment on transactionItem {
    chainId
    vaultAddress
    collectionAddress
    tokenId
    amount
    name
    image
  }
`;

export const PAIR_FRAGMENT = gql`
  fragment PairFragment on pair {
    chainId
    address
    version
    name
    token0Address
    token1Address
    token0 {
      ...TokenFragment
    }
    token1 {
      ...TokenFragment
    }
    isVaultVault
    hasVault
    reserve0
    reserve1
    reserveUsd
    totalSupply
    txCount
    volume0
    volume1
    volumeUsd
    lpFee
    protocolFee
    royaltiesFee
    royaltiesBeneficiary
  }
`;

export const PAIR_HOUR_DATA_FRAGMENT = gql`
  fragment PairHourDataFragment on pairHourData {
    date
    reserve0
    reserve1
    reserveUsd
    volume0
    volume1
    volumeUsd
    txCount
  }
`;

export const PAIR_DAY_DATA_FRAGMENT = gql`
  fragment PairDayDataFragment on pairDayData {
    date
    reserve0
    reserve1
    reserveUsd
    volume0
    volume1
    volumeUsd
    txCount
  }
`;

export const getPairTransactions = gql`
  ${TRANSACTION_ITEM_FRAGMENT}
  query GetPairTransactions(
    $chainId: Float!
    $address: String!
    $where: transactionFilter
    $limit: Int = 15
    $orderBy: String = "timestamp"
    $orderDirection: String = "desc"
  ) {
    pair(chainId: $chainId, address: $address) {
      token0Address
      token1Address
      transactions(
        where: $where
        limit: $limit
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
        items {
          chainId
          hash
          timestamp
          type
          userAddress
          amount0
          amount1
          amountUsd
          isAmount1Out
          items {
            items {
              ...TransactionItemFragment
            }
          }
        }
      }
    }
  }
`;

export const getPairs = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_HOUR_DATA_FRAGMENT}
  ${PAIR_DAY_DATA_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetPairs(
    $where: pairFilter = { reserve0_not: "0" }
    $limit: Int = 100
    $orderBy: String = "reserveUsd"
    $orderDirection: String = "desc"
    $hourDataWhere: pairHourDataFilter
    $dayDataWhere: pairDayDataFilter
  ) {
    pairs(
      where: $where
      limit: $limit
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      items {
        ...PairFragment
        hourData(
          where: $hourDataWhere
          orderBy: "date"
          orderDirection: "desc"
        ) {
          items {
            ...PairHourDataFragment
          }
        }
        dayData(
          where: $dayDataWhere
          orderBy: "date"
          orderDirection: "desc"
        ) {
          items {
            ...PairDayDataFragment
          }
        }
      }
    }
  }
`;

export const getPair = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_HOUR_DATA_FRAGMENT}
  ${PAIR_DAY_DATA_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetPair(
    $chainId: Float!
    $address: String!
    $hourDataWhere: pairHourDataFilter
    $dayDataWhere: pairDayDataFilter
  ) {
    pair(chainId: $chainId, address: $address) {
      ...PairFragment
      hourData(
        where: $hourDataWhere
        orderBy: "date"
        orderDirection: "desc"
      ) {
        items {
          ...PairHourDataFragment
        }
      }
      dayData(
        where: $dayDataWhere
        orderBy: "date"
        orderDirection: "desc"
      ) {
        items {
          ...PairDayDataFragment
        }
      }
    }
  }
`;
