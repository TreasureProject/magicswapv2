import gql from "graphql-tag";

export const getGames = gql`
  query GetGames {
    games(orderBy: "name", orderDirection: "asc") {
      items {
        id
        name
        image
      }
    }
  }
`;
