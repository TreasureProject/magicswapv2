import gql from "graphql-tag";

import {
  INCENTIVE_FRAGMENT,
  PAIR_DAY_DATA_FRAGMENT,
  PAIR_FRAGMENT,
} from "./pair.queries";
import { TOKEN_FRAGMENT } from "./token.queries";

export const getUserPositions = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  ${PAIR_DAY_DATA_FRAGMENT}
  query GetUserPositions(
    $address: String!
    $where: liquidityPositionFilter
    $limit: Int = 100
    $dayDataWhere: pairDayDataFilter
    $orderBy: String = "balance"
    $orderDirection: String = "desc"
  ) {
    user(address: $address) {
      liquidityPositionCount
      liquidityPositions(
        where: $where
        limit: $limit
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
        items {
          pair {
            ...PairFragment
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
          balance
        }
      }
    }
  }
`;

export const getUserPosition = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetUserPosition(
    $chainId: Int!
    $pairAddress: String!
    $userAddress: String!
  ) {
    liquidityPositions(where: {
      chainId: $chainId
      userAddress: $userAddress
      pairAddress: $pairAddress
    }) {
      items {
        balance
      }
    }
    userIncentives(where: {
      chainId: $chainId
      userAddress: $userAddress
      pairAddress: $pairAddress
    }) {
      items {
        incentive {
          ...IncentiveFragment
        }
        isSubscribed
      }
    }
    userPairStakes(where: {
      chainId: $chainId
      userAddress: $userAddress
      pairAddress: $pairAddress
    }) {
      items {
        amount
      }
    }
  }
`;
