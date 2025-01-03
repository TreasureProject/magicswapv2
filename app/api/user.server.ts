import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { ExecutionResult } from "graphql";
import { arbitrum } from "viem/chains";

import { UINT112_MAX } from "~/consts";
import { CHAIN_ID_TO_TROVE_API_URL } from "~/consts";
import { stakingContractAbi } from "~/generated";
import { getContractAddress } from "~/lib/address";
import { getCachedValue } from "~/lib/cache.server";
import { getViemClient } from "~/lib/chain.server";
import { getOneWeekAgoTimestamp } from "~/lib/date.server";
import { ENV } from "~/lib/env.server";
import { floorBigInt } from "~/lib/number";
import type { AccountDomains } from "~/types";
import { pairToPool } from "./pools.server";
import { fetchVaultReserveItems } from "./tokens.server";
import {
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
  return {
    total: Number(user.liquidityPositionCount),
    positions:
      user.liquidityPositions?.items.map(({ pair, ...liquidityPosition }) => ({
        ...liquidityPosition,
        pool: pairToPool(pair!),
      })) ?? [],
  };
};

export const fetchUserPosition = async (params: {
  chainId: number;
  pairAddress: string;
  userAddress: string;
}) => {
  const { chainId, userAddress } = params;
  const result = (await execute(
    GetUserPositionDocument,
    params,
  )) as ExecutionResult<GetUserPositionQuery>;
  const userIncentives = result.data?.userIncentives.items ?? [];

  const client = getViemClient(chainId);
  const [incentives, rewardsPerLiquidityLast] = await Promise.all([
    client.multicall({
      contracts: userIncentives.map((userIncentive) => ({
        address: getContractAddress({ chainId, contract: "stakingContract" }),
        abi: stakingContractAbi,
        functionName: "incentives",
        args: [BigInt(userIncentive.incentive?.incentiveId ?? 0n)],
      })),
    }),
    client.multicall({
      contracts: userIncentives.map((userIncentive) => ({
        address: getContractAddress({ chainId, contract: "stakingContract" }),
        abi: stakingContractAbi,
        functionName: "rewardPerLiquidityLast",
        args: [userAddress, BigInt(userIncentive.incentive?.incentiveId ?? 0n)],
      })),
    }),
  ]);

  const usersLiquidity = BigInt(
    result.data?.userPairStakes.items[0]?.amount ?? 0,
  );
  return {
    lpBalance: result.data?.liquidityPositions.items[0]?.balance ?? "0",
    lpStaked: result.data?.userPairStakes.items[0]?.amount ?? "0",
    userIncentives: await Promise.all(
      userIncentives.map(async (userIncentive, i) => {
        const rewardToken = userIncentive.incentive?.rewardToken;
        const rewardTokenIsVault =
          rewardToken?.isVault ??
          userIncentive.incentive?.isRewardRounded ??
          false;
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
          isActive:
            Number(userIncentive.incentive?.endTime ?? 0) >
            Math.floor(Date.now() / 1000),
          incentive: {
            ...userIncentive.incentive,
            vaultItems:
              rewardToken && rewardTokenIsVault
                ? await fetchVaultReserveItems({
                    chainId,
                    address: rewardToken.address,
                  })
                : [],
          },
          reward: rewardTokenIsVault
            ? floorBigInt(reward, rewardToken?.decimals).toString()
            : reward.toString(),
          lastRewardTime,
        };
      }),
    ),
  };
};

export type UserIncentive = Awaited<
  ReturnType<typeof fetchUserPosition>
>["userIncentives"][number];

export const fetchDomain = async (address: string) =>
  getCachedValue(`domain-${address}`, async () => {
    const response = await fetch(
      `${CHAIN_ID_TO_TROVE_API_URL[arbitrum.id]}/domain/${address}`,
      {
        headers: {
          "X-API-Key": ENV.TROVE_API_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching domain: ${response.statusText}`);
    }

    const result = (await response.json()) as AccountDomains;
    return result;
  });

export const fetchDomains = async (addresses: string[]) => {
  const uniqueAddresses = [...new Set(addresses.filter((address) => address))];
  return getCachedValue(`domains-${uniqueAddresses.join(",")}`, async () => {
    const response = await fetch(
      `${CHAIN_ID_TO_TROVE_API_URL[arbitrum.id]}/batch-domains`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ENV.TROVE_API_KEY,
        },
        body: JSON.stringify({ addresses: uniqueAddresses }),
      },
    );

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
