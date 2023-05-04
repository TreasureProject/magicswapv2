import gql from "graphql-tag";

import { PAIR_FRAGMENT } from "./pair.queries";
import { TOKEN_FRAGMENT } from "./token.queries";

export const getUser = gql`
  ${TOKEN_FRAGMENT}
  ${PAIR_FRAGMENT}
  query getUser($id: ID!) {
    user(id: $id) {
      liquidityPositions {
        pair {
          ...PairFragment
        }
        balance
      }
    }
  }
`;
