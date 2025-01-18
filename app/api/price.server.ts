import type { ExecutionResult } from "graphql";
import {
  GetMagicPriceDocument,
  type GetMagicPriceQuery,
  execute,
} from ".graphclient";

export const fetchMagicUsd = async () => {
  const result = (await execute(
    GetMagicPriceDocument,
    {},
  )) as ExecutionResult<GetMagicPriceQuery>;
  return result.data?.price?.magicUsd ?? 0;
};
