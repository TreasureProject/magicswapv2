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
