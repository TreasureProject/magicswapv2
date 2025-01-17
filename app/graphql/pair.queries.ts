import gql from "graphql-tag";

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
    volume0
    volume1
    volumeUsd
    lpFee
    protocolFee
    royaltiesFee
    royaltiesBeneficiary
    incentives {
      items {
        incentiveId
        startTime
        endTime
        rewardTokenAddress
        rewardToken {
          ...TokenFragment
        }
        rewardAmount
        remainingRewardAmount
        isRewardRounded
      }
    }
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
  }
`;

export const getPairTransactions = gql`
  ${TRANSACTION_ITEM_FRAGMENT}
  query GetPairTransactions(
    $chainId: Float!
    $address: String!
    $where: transactionFilter
    $orderBy: String = "timestamp"
    $orderDirection: String = "desc"
    $limit: Int = 15
    $before: String
    $after: String
  ) {
    pair(chainId: $chainId, address: $address) {
      token0Address
      token1Address
      transactions(
        where: $where
        orderBy: $orderBy
        orderDirection: $orderDirection
        limit: $limit
        before: $before
        after: $after
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
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
        totalCount
      }
    }
  }
`;

export const getPairs = gql`
  ${PAIR_HOUR_DATA_FRAGMENT}
  ${PAIR_DAY_DATA_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetPairs(
    $where: pairFilter
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

export const getPairIncentives = gql`
  query GetPairIncentives($id: String!) {
    incentives(where: { pairAddress: $id }) {
      items {
        incentiveId
        startTime
        endTime
        rewardTokenAddress
        rewardToken {
          ...TokenFragment
        }
        rewardAmount
        remainingRewardAmount
        isRewardRounded
      }
    }
  }
`;
