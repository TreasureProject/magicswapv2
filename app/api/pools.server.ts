import type { ExecutionResult } from "graphql";
import type { Address } from "viem";

import { stakingContractAbi, uniswapV2PairAbi } from "~/generated";
import { getContractAddress } from "~/lib/address";
import { aprToApy } from "~/lib/apr";
import { getViemClient } from "~/lib/chain.server";
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

export const pairToPool = async (
  pair: GetPairsQuery["pairs"]["items"][number],
): Promise<Pool> => {
  if (!pair.token0 || !pair.token1) {
    throw new Error("Invalid pair");
  }

  const client = getViemClient(pair.chainId);
  const [[reserve0, reserve1], totalSupply, ...incentives] = await Promise.all([
    client.readContract({
      address: pair.address as Address,
      abi: uniswapV2PairAbi,
      functionName: "getReserves",
    }),
    client.readContract({
      address: pair.address as Address,
      abi: uniswapV2PairAbi,
      functionName: "totalSupply",
    }),
    ...(pair.incentives?.items.map((incentive) =>
      client.readContract({
        address: getContractAddress({
          chainId: pair.chainId,
          contract: "stakingContract",
        }),
        abi: stakingContractAbi,
        functionName: "incentives",
        args: [BigInt(incentive.incentiveId)],
      }),
    ) ?? []),
  ]);

  const incentiveRewardRemaining = incentives.reduce(
    (acc, curr, i) => {
      const incentiveId = pair.incentives?.items[i].incentiveId ?? "0";
      acc[incentiveId] = curr[7];
      return acc;
    },
    {} as Record<string, bigint>,
  );

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
      ? bigIntToNumber(reserve0, token0.decimals)
      : bigIntToNumber(reserve1, token1.decimals);
  const apr =
    aprReserve > 0 ? ((volume1w / 7) * 365 * pair.lpFee) / aprReserve : 0;
  return {
    ...pair,
    token0,
    token1,
    totalSupply: totalSupply.toString(),
    reserve0: reserve0.toString(),
    reserve1: reserve1.toString(),
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
    incentives: {
      ...pair.incentives,
      items:
        pair.incentives?.items.map((incentive) => ({
          ...incentive,
          remainingRewardAmount:
            incentiveRewardRemaining[incentive.incentiveId].toString(),
        })) ?? [],
    },
  };
};

export const fetchPools = async (where?: PairFilter): Promise<Pool[]> => {
  const now = Math.floor(Date.now() / 1000);
  const result = (await execute(GetPairsDocument, {
    where,
    hourDataWhere: {
      date_gte: now - 86400, // 1 day ago
    },
    dayDataWhere: {
      date_gte: now - 86400 * 7, // 7 days ago
    },
  })) as ExecutionResult<GetPairsQuery>;
  return Promise.all(
    result.data?.pairs.items.map((pair) => pairToPool(pair)) ?? [],
  );
};

export const fetchPool = async (params: {
  chainId: number;
  address: string;
}): Promise<Pool | undefined> => {
  const now = Math.floor(Date.now() / 1000);
  const result = (await execute(GetPairDocument, {
    ...params,
    hourDataWhere: {
      date_gte: now - 86400, // 1 day ago
    },
    dayDataWhere: {
      date_gte: now - 86400 * 7, // 7 days ago
    },
  })) as ExecutionResult<GetPairQuery>;
  const pair = result.data?.pair;
  return pair ? pairToPool(pair) : undefined;
};
