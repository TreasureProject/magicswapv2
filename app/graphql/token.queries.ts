import gql from "graphql-tag";

export const TOKEN_FRAGMENT = gql`
  fragment TokenFragment on token {
    chainId
    address
    name
    symbol
    image
    decimals
    derivedMagic
    isVault
    isMagic
    isEth
    collectionAddress
    collectionTokenIds
    collectionType
    collectionName
    collectionImage
    reserveItems {
      items {
        tokenId
        amount
      }
    }
  }
`;

export const getToken = gql`
  ${TOKEN_FRAGMENT}
  query GetToken($chainId: Float!, $address: String!) {
    token(chainId: $chainId, address: $address) {
      ...TokenFragment
    }
  }
`;

export const getTokens = gql`
  ${TOKEN_FRAGMENT}
  query GetTokens(
    $where: tokenFilter
    $limit: Int = 100
    $orderBy: String = "symbol"
    $orderDirection: String = "asc"
  ) {
    tokens(
      where: $where
      limit: $limit
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      items {
        ...TokenFragment
      }
    }
  }
`;

export const getTokenVaultReserveItems = gql`
  query GetTokenVaultReserveItems(
    $chainId: Int!
    $address: String!
    $limit: Int = 50
    $orderBy: String = "tokenId"
    $orderDirection: String = "asc"
  ) {
    vaultReserveItems(
      where: { chainId: $chainId, vaultAddress: $address }
      limit: $limit
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      items {
        collectionAddress
        tokenId
        name
        image
        amount
      }
    }
  }
`;
