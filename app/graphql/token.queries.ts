import gql from "graphql-tag";

export const TOKEN_FRAGMENT = gql`
  fragment TokenFragment on Token {
    id
    name
    symbol
    decimals
    derivedMAGIC
    isNFT
    vaultCollections {
      collection {
        id
        type
      }
      tokenIds
    }
    vaultReserveItems {
      tokenId
      amount
    }
  }
`;

export const getToken = gql`
  ${TOKEN_FRAGMENT}
  query GetToken($id: ID!) {
    token(id: $id) {
      ...TokenFragment
    }
  }
`;

export const getTokens = gql`
  ${TOKEN_FRAGMENT}
  query GetTokens {
    tokens {
      ...TokenFragment
    }
  }
`;

export const getTokenVaultReserveItems = gql`
  query GetTokenVaultReserveItems(
    $id: String!
    $first: Int = 50
    $skip: Int = 0
  ) {
    vaultReserveItems(
      first: $first
      skip: $skip
      where: { vault: $id }
      orderBy: tokenId
      orderDirection: asc
    ) {
      collection {
        id
      }
      tokenId
      amount
    }
  }
`;
