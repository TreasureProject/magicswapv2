import type { FragmentOf, VariablesOf } from "gql.tada";
import type { Address } from "viem";

import { stakingContractAbi, uniswapV2PairAbi } from "~/generated";
import { graphql } from "~/gql/query.server";
import { getContractAddress } from "~/lib/address";
import { aprToApy } from "~/lib/apr";
import { getViemClient } from "~/lib/chain.server";
import { getContext } from "~/lib/env.server";
import { bigIntToNumber } from "~/lib/number";
import { fetchDomains } from "./domain.server";
import { TokenFragment } from "./tokens.server";

const TransactionItemFragment = graphql(`
  fragment TransactionItemFragment on transactionItem @_unmask {
    chainId
    vaultAddress
    collectionAddress
    tokenId
    amount
    name
    image
  }
`);

export const PairFragment = graphql(
  `
  fragment PairFragment on pair @_unmask {
    chainId
    address
    version
    name
    token0Address
    token1Address
    token0 {
      ...TokenFragment
    }
    token1 {
      ...TokenFragment
    }
    isVaultVault
    hasVault
    reserve0
    reserve1
    reserveUsd
    totalSupply
    volume0
    volume1
    volumeUsd
    lpFee
    protocolFee
    royaltiesFee
    royaltiesBeneficiary
    incentives {
      items {
        incentiveId
        startTime
        endTime
        rewardTokenAddress
        rewardToken {
          ...TokenFragment
        }
        rewardAmount
        remainingRewardAmount
        isRewardRounded
      }
    }
  }
`,
  [TokenFragment],
);

const PairHourDataFragment = graphql(`
  fragment PairHourDataFragment on pairHourData @_unmask {
    date
    reserve0
    reserve1
    reserveUsd
    volume0
    volume1
    volumeUsd
  }
`);

export const PairDayDataFragment = graphql(`
  fragment PairDayDataFragment on pairDayData @_unmask {
    date
    reserve0
    reserve1
    reserveUsd
    volume0
    volume1
    volumeUsd
  }
`);

export const getPairTransactionsQuery = graphql(
  `
  query getPairTransactions(
    $chainId: Float!
    $address: String!
    $where: transactionFilter
    $orderBy: String = "timestamp"
    $orderDirection: String = "desc"
    $limit: Int = 15
    $before: String
    $after: String
  ) {
    pair(chainId: $chainId, address: $address) {
      token0Address
      token1Address
      transactions(
        where: $where
        orderBy: $orderBy
        orderDirection: $orderDirection
        limit: $limit
        before: $before
        after: $after
      ) {
        items {
          chainId
          hash
          timestamp
          type
          userAddress
          amount0
          amount1
          amountUsd
          isAmount1Out
          items {
            items {
              ...TransactionItemFragment
            }
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasPreviousPage
          hasNextPage
        }
        totalCount
      }
    }
  }
`,
  [TransactionItemFragment],
);

export const getPairsQuery = graphql(
  `
  query getPairs(
    $where: pairFilter
    $limit: Int = 100
    $orderBy: String = "reserveUsd"
    $orderDirection: String = "desc"
    $hourDataWhere: pairHourDataFilter
    $dayDataWhere: pairDayDataFilter
  ) {
    pairs(
      where: $where
      limit: $limit
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      items {
        ...PairFragment
        hourData(
          where: $hourDataWhere
          orderBy: "date"
          orderDirection: "desc"
        ) {
          items {
            ...PairHourDataFragment
          }
        }
        dayData(
          where: $dayDataWhere
          orderBy: "date"
          orderDirection: "desc"
        ) {
          items {
            ...PairDayDataFragment
          }
        }
      }
    }
  }
`,
  [PairFragment, PairHourDataFragment, PairDayDataFragment],
);

export const getPairQuery = graphql(
  `
  query getPair(
    $chainId: Float!
    $address: String!
    $hourDataWhere: pairHourDataFilter
    $dayDataWhere: pairDayDataFilter
  ) {
    pair(chainId: $chainId, address: $address) {
      ...PairFragment
      hourData(
        where: $hourDataWhere
        orderBy: "date"
        orderDirection: "desc"
      ) {
        items {
          ...PairHourDataFragment
        }
      }
      dayData(
        where: $dayDataWhere
        orderBy: "date"
        orderDirection: "desc"
      ) {
        items {
          ...PairDayDataFragment
        }
      }
    }
  }
`,
  [PairFragment, PairHourDataFragment, PairDayDataFragment],
);

export const getPairIncentiveQuery = graphql(
  `
  query getPairIncentives($id: String!) {
    incentives(where: { pairAddress: $id }) {
      items {
        incentiveId
        startTime
        endTime
        rewardTokenAddress
        rewardToken {
          ...TokenFragment
        }
        rewardAmount
        remainingRewardAmount
        isRewardRounded
      }
    }
  }
`,
  [TokenFragment],
);

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
  type?: NonNullable<
    VariablesOf<typeof getPairTransactionsQuery>["where"]
  >["type"];
  limit?: number;
  before?: string;
  after?: string;
}) => {
  const { graphClient } = getContext();
  const { pair } = await graphClient.request(getPairTransactionsQuery, {
    chainId,
    address,
    limit,
    before,
    after,
    ...(type ? { where: { type } } : undefined),
  });
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
  pair: FragmentOf<typeof PairFragment> & {
    hourData?: { items: FragmentOf<typeof PairHourDataFragment>[] } | null;
    dayData?: { items: FragmentOf<typeof PairDayDataFragment>[] } | null;
  },
) => {
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

export const fetchPools = async (where?: PairFilter) => {
  const { graphClient } = getContext();
  const now = Math.floor(Date.now() / 1000);
  const { pairs } = await graphClient.request(getPairsQuery, {
    where,
    hourDataWhere: {
      date_gte: BigInt(now - 86400).toString(), // 1 day ago
    },
    dayDataWhere: {
      date_gte: BigInt(now - 86400 * 7).toString(), // 7 days ago
    },
  });
  return Promise.all(pairs.items.map((pair) => pairToPool(pair)) ?? []);
};

export const fetchPool = async (params: {
  chainId: number;
  address: string;
}) => {
  const { graphClient } = getContext();
  const now = Math.floor(Date.now() / 1000);
  const { pair } = await graphClient.request(getPairQuery, {
    ...params,
    hourDataWhere: {
      date_gte: BigInt(now - 86400).toString(), // 1 day ago
    },
    dayDataWhere: {
      date_gte: BigInt(now - 86400 * 7).toString(), // 7 days ago
    },
  });
  return pair ? pairToPool(pair) : undefined;
};

export type PairFilter = VariablesOf<typeof getPairsQuery>["where"];
export type Pool = Awaited<ReturnType<typeof pairToPool>>;
export type TransactionType = NonNullable<
  VariablesOf<typeof getPairTransactionsQuery>["where"]
>["type"];
