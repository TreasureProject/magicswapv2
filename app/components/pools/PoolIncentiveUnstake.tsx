import { useCallback, useState } from "react";
import { type Address, formatEther, parseEther, parseUnits } from "viem";

import type { SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import { useAccount } from "~/contexts/account";
import { useTokenBalance } from "~/hooks/useTokenBalance";
import { useUnstake } from "~/hooks/useUnstake";
import { useWithdrawBatch } from "~/hooks/useWithdrawBatch";
import type { Pool } from "~/lib/pools.server";
import type { loader } from "~/routes/pools_.$id";
import type { NumberString } from "~/types";
import { SelectionPopup } from "../SelectionPopup";
import { TransactionButton } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { PoolInput } from "./PoolInput";

type Props = {
  pool: Pool;
  staked: bigint;
};

export const PoolIncentiveUnstake = ({ pool, staked }: Props) => {
  const { poolIncentives } = useRouteLoaderData(
    "routes/pools_.$id",
  ) as SerializeFrom<typeof loader>;
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);

  const nftIncentive = [...poolIncentives]
    .sort((a, b) => Number(b.startTime) - Number(a.startTime))
    .find((poolIncentive) => poolIncentive.rewardToken?.isNFT);

  const [rawAmount, setRawAmount] = useState("0");
  const { isConnected, address } = useAccount();

  const amount = parseEther(rawAmount as NumberString);
  const hasAmount = amount > 0;

  const { withdrawBatch, isLoading } = useWithdrawBatch({
    vaultAddress: nftIncentive?.rewardTokenAddress as Address | undefined,
  });

  const { data: nftRewardsBalance, refetch: nftRewardsRefetch } =
    useTokenBalance({
      id: nftIncentive?.rewardTokenAddress as Address | undefined,
      address,
    });

  const { unstake } = useUnstake({
    pool,
    amount,
    onSuccess: useCallback(() => {
      setRawAmount("0");
      nftRewardsRefetch();
      setIsClaimDialogOpen(true);
    }, [nftRewardsRefetch]),
  });

  return (
    <>
      <PoolInput
        pool={pool}
        balance={staked}
        amount={rawAmount}
        isBalanceStaked
        onUpdateAmount={setRawAmount}
      />
      <TransactionButton
        className="w-full"
        size="lg"
        disabled={!isConnected || !hasAmount}
        onClick={() => unstake()}
      >
        Unstake
      </TransactionButton>
      {nftIncentive?.rewardToken && (
        <Dialog open={isClaimDialogOpen} onOpenChange={() => {}}>
          <SelectionPopup
            type="vault"
            token={nftIncentive.rewardToken}
            onSubmit={async (tokens) => {
              await withdrawBatch(
                tokens.map((token) => ({
                  id: BigInt(token.tokenId),
                  amount: BigInt(token.quantity),
                  collectionId: token.collectionAddr as Address,
                })),
              );
              setIsClaimDialogOpen(false);
            }}
            isSubmitDisabled={isLoading}
            keepOpenOnSubmit
            requiredAmount={Number(formatEther(nftRewardsBalance))}
          />
        </Dialog>
      )}
    </>
  );
};
