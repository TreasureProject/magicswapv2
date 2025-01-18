import gql from "graphql-tag";

export const getMagicPrice = gql`
  query GetMagicPrice {
    price(id: 1) {
      magicUsd
    }
  }
`;
