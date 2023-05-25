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
      id
      collection {
        id
      }
      tokenId
      amount
    }
  }
`;

export const getToken = gql`
  ${TOKEN_FRAGMENT}
  query getToken($id: ID!) {
    token(id: $id) {
      ...TokenFragment
    }
  }
`;

export const getTokens = gql`
  ${TOKEN_FRAGMENT}
  query getTokens {
    tokens {
      ...TokenFragment
    }
  }
`;
