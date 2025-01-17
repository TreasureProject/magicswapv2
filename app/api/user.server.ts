import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { ExecutionResult } from "graphql";
import { arbitrum } from "viem/chains";

import { UINT112_MAX } from "~/consts";
import { CHAIN_ID_TO_TROVE_API_URL } from "~/consts";
import { erc20Abi, stakingContractAbi } from "~/generated";
import { getContractAddress } from "~/lib/address";
import { getCachedValue } from "~/lib/cache.server";
import { getViemClient } from "~/lib/chain.server";
import { ENV } from "~/lib/env.server";
import { floorBigInt } from "~/lib/number";
import type { AccountDomains, AddressString } from "~/types";
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

export const fetchUserPositions = async ({
  address,
  chainId,
}: {
  address: string | undefined;
  chainId?: number;
}) => {
  if (!address) {
    return {
      total: 0,
      positions: [],
    };
  }

  const result = (await execute(GetUserPositionsDocument, {
    address: address.toLowerCase(),
    where: {
      chainId,
    },
    dayDataWhere: {
      date_gte: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
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
    total: user.liquidityPositionCount,
    positions: await Promise.all(
      user.liquidityPositions?.items.map(
        async ({ pair, ...liquidityPosition }) => ({
          ...liquidityPosition,
          pool: await pairToPool(pair!),
        }),
      ) ?? [],
    ),
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
  const [incentives, rewardsPerLiquidityLast, lpBalance] = await Promise.all([
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
    client.readContract({
      address: params.pairAddress as AddressString,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress as AddressString],
    }),
  ]);

  const usersLiquidity = BigInt(
    result.data?.userPairStakes.items[0]?.amount ?? 0,
  );
  return {
    lpBalance: lpBalance.toString(),
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
  const uniqueAddresses = [
    ...new Set(addresses.filter((address) => address)),
  ].sort();
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
