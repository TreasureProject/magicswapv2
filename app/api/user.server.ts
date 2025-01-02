import type { ExecutionResult } from "graphql";

import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import { CONTRACT_ADDRESSES, UINT112_MAX } from "~/consts";
import { stakingContractAbi } from "~/generated";
import { getCachedValue } from "~/lib/cache.server";
import { client } from "~/lib/chain.server";
import { getOneWeekAgoTimestamp } from "~/lib/date.server";
import { ENV } from "~/lib/env.server";
import { floorBigInt } from "~/lib/number";
import { createPoolToken } from "~/lib/tokens.server";
import type { AccountDomains, Token } from "~/types";
import { fetchTokensCollections } from "./collections.server";
import { createPoolsFromPairs } from "./pools.server";
import { fetchMagicUSD } from "./stats.server";
import { fetchVaultReserveItems } from "./tokens.server";
import {
  GetUserIncentivesDocument,
  type GetUserIncentivesQuery,
  GetUserPositionDocument,
  type GetUserPositionQuery,
  GetUserPositionsDocument,
  type GetUserPositionsQuery,
  execute,
} from ".graphclient";

type Incentive = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof stakingContractAbi, "incentives">["outputs"],
  "outputs"
>;

export const fetchUserPositions = async (address: string | undefined) => {
  if (!address) {
    return {
      total: 0,
      positions: [],
    };
  }

  const result = (await execute(GetUserPositionsDocument, {
    id: address,
    dayDataWhere: {
      date_gte: getOneWeekAgoTimestamp(),
    },
  })) as ExecutionResult<GetUserPositionsQuery>;
  if (!result.data?.user) {
    return {
      total: 0,
      positions: [],
    };
  }

  const { user } = result.data;
  const pools = await createPoolsFromPairs(
    user.liquidityPositions.map(({ pair }) => pair),
  );
  const poolsMapping = pools.reduce(
    (acc, pool) => {
      acc[pool.id] = pool;
      return acc;
    },
    {} as Record<string, (typeof pools)[0]>,
  );

  return {
    total: Number(user.liquidityPositionCount),
    positions: user.liquidityPositions.map(({ balance, pair }) => ({
      balance,
      // biome-ignore lint/style/noNonNullAssertion: poolsMapping is created with keys from pairs directly above
      pool: poolsMapping[pair.id]!,
    })),
  };
};

export const fetchUserPosition = async (
  address: string | undefined,
  poolId: string,
) => {
  if (!address) {
    return { lpBalance: "0", lpStaked: "0" };
  }

  const { data } = (await execute(GetUserPositionDocument, {
    id: address,
    pairId: poolId,
  })) as ExecutionResult<GetUserPositionQuery>;
  return {
    lpBalance: data?.liquidityPositions[0]?.balance ?? "0",
    lpStaked: data?.userStakes[0]?.amount ?? "0",
  };
};

export const fetchUserIncentives = async (
  address: string | undefined,
  poolId: string,
) => {
  if (!address) {
    return [];
  }

  const { data } = (await execute(GetUserIncentivesDocument, {
    id: address,
    pairId: poolId,
  })) as ExecutionResult<GetUserIncentivesQuery>;

  const userIncentives = data?.userIncentives ?? [];
  if (userIncentives.length === 0) {
    return [];
  }

  const [
    incentives,
    rewardsPerLiquidityLast,
    [collectionMapping, tokenMapping],
    magicUSD,
  ] = await Promise.all([
    client.multicall({
      contracts: userIncentives.map((userIncentive) => ({
        address: CONTRACT_ADDRESSES[ENV.PUBLIC_CHAIN_ID].stakingContract,
        abi: stakingContractAbi,
        functionName: "incentives",
        args: [BigInt(userIncentive.incentive.incentiveId)],
      })),
    }),
    client.multicall({
      contracts: userIncentives.map((userIncentive) => ({
        address: CONTRACT_ADDRESSES[ENV.PUBLIC_CHAIN_ID].stakingContract,
        abi: stakingContractAbi,
        functionName: "rewardPerLiquidityLast",
        args: [address, BigInt(userIncentive.incentive.incentiveId)],
      })),
    }),
    fetchTokensCollections(
      userIncentives
        .map((userIncentive) => userIncentive.incentive.rewardToken)
        .filter(Boolean) as Token[],
    ),
    fetchMagicUSD(),
  ]);

  const usersLiquidity = BigInt(data?.userStakes[0]?.amount ?? "0");
  const enrichedUserIncentives = await Promise.all(
    userIncentives.map(async (userIncentive, i) => {
      const rewardToken = userIncentive.incentive.rewardToken
        ? createPoolToken(
            userIncentive.incentive.rewardToken,
            collectionMapping,
            tokenMapping,
            magicUSD,
          )
        : null;
      const rewardTokenIsVault =
        rewardToken?.isNFT ?? userIncentive.incentive.isRewardRounded;
      let [
        ,
        ,
        ,
        endTime = 0,
        ,
        rewardPerLiquidity = 0n,
        lastRewardTime = 0,
        rewardRemaining = 0n,
        liquidityStaked = 0n,
      ] = (incentives[i]?.result as unknown as Incentive | undefined) ?? [];

      const currentTime = Math.floor(Date.now() / 1000);
      const maxTime = Math.min(currentTime, endTime);
      if (liquidityStaked > 0 && lastRewardTime < maxTime) {
        const totalTime = endTime - lastRewardTime;
        const passedTime = maxTime - lastRewardTime;
        const reward =
          (rewardRemaining * BigInt(passedTime)) / BigInt(totalTime);
        rewardPerLiquidity += (reward * UINT112_MAX) / liquidityStaked;
        rewardRemaining -= reward;
      }

      const userRewardPerLiquidtyLast = rewardsPerLiquidityLast[i]?.result
        ? (rewardsPerLiquidityLast[i].result as unknown as bigint)
        : 0n;
      const rewardPerLiquidityDelta =
        rewardPerLiquidity - userRewardPerLiquidtyLast;
      const reward = (rewardPerLiquidityDelta * usersLiquidity) / UINT112_MAX;
      return {
        ...userIncentive,
        incentive: {
          ...userIncentive.incentive,
          rewardToken: rewardToken,
          vaultItems:
            rewardToken && rewardTokenIsVault
              ? await fetchVaultReserveItems({
                  id: rewardToken.id,
                })
              : [],
        },
        reward: rewardTokenIsVault
          ? floorBigInt(reward, rewardToken?.decimals).toString()
          : reward.toString(),
        lastRewardTime,
      };
    }),
  );
  return enrichedUserIncentives;
};

export type UserIncentive = Awaited<
  ReturnType<typeof fetchUserIncentives>
>[number];

export const fetchDomain = async (address: string) =>
  getCachedValue(`domain-${address}`, async () => {
    const response = await fetch(`${ENV.TROVE_API_URL}/domain/${address}`, {
      headers: {
        "X-API-Key": ENV.TROVE_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching domain: ${response.statusText}`);
    }

    const result = (await response.json()) as AccountDomains;
    return result;
  });

export const fetchDomains = async (addresses: string[]) => {
  const uniqueAddresses = [...new Set(addresses.filter((address) => address))];
  return getCachedValue(`domains-${uniqueAddresses.join(",")}`, async () => {
    const response = await fetch(`${ENV.TROVE_API_URL}/batch-domains`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ENV.TROVE_API_KEY,
      },
      body: JSON.stringify({ addresses: uniqueAddresses }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching domains: ${response.statusText}`);
    }

    const result = (await response.json()) as AccountDomains[];
    return result.reduce(
      (acc, domain) => {
        acc[domain.address] = domain;
        return acc;
      },
      {} as Record<string, AccountDomains>,
    );
  });
};
