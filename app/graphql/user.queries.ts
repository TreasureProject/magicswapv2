import gql from "graphql-tag";

import { PAIR_FRAGMENT } from "./pair.queries";
import { TOKEN_FRAGMENT } from "./token.queries";

export const getUser = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query GetUser($id: ID!) {
    user(id: $id) {
      liquidityPositionCount
      liquidityPositions {
        pair {
          ...PairFragment
        }
        balance
      }
    }
  }
`;
