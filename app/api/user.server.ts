import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address } from "viem";

import { UINT112_MAX } from "~/consts";
import { erc20Abi, stakingContractAbi } from "~/generated";
import { graphql } from "~/gql/query.server";
import { getContractAddress } from "~/lib/address";
import { getViemClient } from "~/lib/chain.server";
import { getContext } from "~/lib/env.server";
import { floorBigInt } from "~/lib/number";
import { PairDayDataFragment, PairFragment, pairToPool } from "./pools.server";
import { TokenFragment, fetchVaultReserveItems } from "./tokens.server";

type Incentive = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof stakingContractAbi, "incentives">["outputs"],
  "outputs"
>;

const getUserPositionsQuery = graphql(
  `
  query getUserPositions(
    $address: String!
    $where: liquidityPositionFilter
    $limit: Int = 100
    $dayDataWhere: pairDayDataFilter
    $orderBy: String = "balance"
    $orderDirection: String = "desc"
  ) {
    user(address: $address) {
      liquidityPositionCount
      liquidityPositions(
        where: $where
        limit: $limit
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
        items {
          pair {
            ...PairFragment
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
          balance
        }
      }
    }
  }
`,
  [PairFragment, PairDayDataFragment],
);

const getUserPositionQuery = graphql(
  `
  query getUserPosition(
    $chainId: Int!
    $pairAddress: String!
    $userAddress: String!
  ) {
    liquidityPositions(where: {
      chainId: $chainId
      userAddress: $userAddress
      pairAddress: $pairAddress
    }) {
      items {
        balance
      }
    }
    userIncentives(where: {
      chainId: $chainId
      userAddress: $userAddress
      pairAddress: $pairAddress
    }) {
      items {
        incentive {
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
        isSubscribed
      }
    }
    userPairStakes(where: {
      chainId: $chainId
      userAddress: $userAddress
      pairAddress: $pairAddress
    }) {
      items {
        amount
      }
    }
  }
`,
  [TokenFragment],
);

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

  const { graphClient } = getContext();
  const { user } = await graphClient.request(getUserPositionsQuery, {
    address: address.toLowerCase(),
    where: {
      chainId,
    },
    dayDataWhere: {
      date_gte: BigInt(Math.floor(Date.now() / 1000) - 86400 * 7).toString(), // 7 days ago
    },
  });
  if (!user) {
    return {
      total: 0,
      positions: [],
    };
  }

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
  const { graphClient } = getContext();
  const {
    userIncentives: { items: userIncentives },
    userPairStakes,
  } = await graphClient.request(getUserPositionQuery, params);

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
      address: params.pairAddress as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress as Address],
    }),
  ]);

  const usersLiquidity = BigInt(userPairStakes.items[0]?.amount ?? 0);
  return {
    lpBalance: lpBalance.toString(),
    lpStaked: userPairStakes.items[0]?.amount ?? "0",
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
