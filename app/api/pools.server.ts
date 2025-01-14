import type { ExecutionResult } from "graphql";

import { aprToApy } from "~/lib/apr";
import {
  getOneDayAgoTimestamp,
  getOneWeekAgoTimestamp,
} from "~/lib/date.server";
import { bigIntToNumber } from "~/lib/number";
import type { Pool } from "~/types";
import {
  GetPairDocument,
  type GetPairQuery,
  GetPairTransactionsDocument,
  type GetPairTransactionsQuery,
  GetPairsDocument,
  type GetPairsQuery,
  type pairFilter as PairFilter,
  type transactionType as TransactionType,
  execute,
} from "../../.graphclient";
import { fetchDomains } from "./user.server";

export const fetchPoolTransactions = async ({
  chainId,
  address,
  type,
  limit,
  before,
  after,
}: {
  chainId: number;
  address: string;
  type?: TransactionType;
  limit?: number;
  before?: string;
  after?: string;
}) => {
  const result = (await execute(GetPairTransactionsDocument, {
    chainId,
    address,
    limit,
    before,
    after,
    ...(type ? { where: { type } } : undefined),
  })) as ExecutionResult<GetPairTransactionsQuery>;
  const { pair } = result.data ?? {};
  if (!pair) {
    throw new Error(`Pair not found: ${address}`);
  }

  const domains = await fetchDomains(
    pair.transactions?.items.map((item) => item.userAddress ?? "") ?? [],
  );

  return {
    ...pair.transactions,
    items:
      pair.transactions?.items.map(({ items, ...transaction }) => ({
        ...transaction,
        userDomain: transaction.userAddress
          ? domains[transaction.userAddress]
          : undefined,
        items0:
          items?.items.filter(
            ({ vaultAddress }) => vaultAddress === pair.token0Address,
          ) ?? [],
        items1:
          items?.items.filter(
            ({ vaultAddress }) => vaultAddress === pair.token1Address,
          ) ?? [],
      })) ?? [],
  };
};

type PoolTransaction = Awaited<
  ReturnType<typeof fetchPoolTransactions>
>["items"][number];
export type PoolTransactionItem = PoolTransaction["items0"][number];

export const pairToPool = (
  pair: GetPairsQuery["pairs"]["items"][number],
): Pool => {
  if (!pair.token0 || !pair.token1) {
    throw new Error("Invalid pair");
  }

  const token0 = pair.token0;
  const token1 = pair.token1;
  const dayData = pair.dayData?.items ?? [];
  const hourData = pair.hourData?.items ?? [];

  const volume1wUsd =
    dayData.reduce((total, { volumeUsd }) => total + volumeUsd, 0) ?? 0;
  const volume1w0 =
    dayData.reduce(
      (total, { volume0 }) => total + bigIntToNumber(volume0, token0.decimals),
      0,
    ) ?? 0;
  const volume1w1 =
    dayData.reduce(
      (total, { volume1 }) => total + bigIntToNumber(volume1, token1.decimals),
      0,
    ) ?? 0;
  const volume1w = pair.isVaultVault || !token0.isVault ? volume1w0 : volume1w1;

  const aprReserve =
    pair.isVaultVault || !token0.isVault
      ? bigIntToNumber(pair.reserve0, token0.decimals)
      : bigIntToNumber(pair.reserve1, token1.decimals);
  const apr =
    aprReserve > 0 ? ((volume1w / 7) * 365 * pair.lpFee) / aprReserve : 0;
  return {
    ...pair,
    token0,
    token1,
    volume24h0:
      hourData.reduce(
        (total, { volume0 }) =>
          total + bigIntToNumber(volume0, token0.decimals),
        0,
      ) ?? 0,
    volume24h1:
      hourData.reduce(
        (total, { volume1 }) =>
          total + bigIntToNumber(volume1, token1.decimals),
        0,
      ) ?? 0,
    volume24hUsd:
      hourData.reduce((total, { volumeUsd }) => total + volumeUsd, 0) ?? 0,
    volume1wUsd,
    apy: aprToApy(apr),
  };
};

export const fetchPools = async (where?: PairFilter): Promise<Pool[]> => {
  const result = (await execute(GetPairsDocument, {
    where,
    hourDataWhere: { date_gte: getOneDayAgoTimestamp() },
    dayDataWhere: {
      date_gte: getOneWeekAgoTimestamp(),
    },
  })) as ExecutionResult<GetPairsQuery>;
  return result.data?.pairs.items.map((pair) => pairToPool(pair)) ?? [];
};

export const fetchPool = async (params: {
  chainId: number;
  address: string;
}): Promise<Pool | undefined> => {
  const result = (await execute(GetPairDocument, {
    ...params,
    hourDataWhere: { date_gte: getOneDayAgoTimestamp() },
    dayDataWhere: {
      date_gte: getOneWeekAgoTimestamp(),
    },
  })) as ExecutionResult<GetPairQuery>;
  const pair = result.data?.pair;
  return pair ? pairToPool(pair) : undefined;
};
