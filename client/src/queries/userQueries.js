import { gql } from "apollo-client";
export const GET_HELLO = gql`
  query greating {
    greating
  }
`;

export default GET_HELLO;
