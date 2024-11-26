import type { PoolIncentive as PoolIncentiveType } from "~/api/pools.server";
import { SelectionPopup } from "~/components/SelectionPopup";
import { Dialog, DialogTrigger } from "~/components/ui/Dialog";
import { bigIntToNumber } from "~/lib/number";

import { useState } from "react";
import { type Address, formatEther } from "viem";
import { useAccount } from "wagmi";
import { useTokenBalance } from "~/hooks/useTokenBalance";
import { useWithdrawBatch } from "~/hooks/useWithdrawBatch";
import { truncateEthAddress } from "~/lib/address";
import { formatAmount, formatUSD } from "~/lib/currency";
import { Badge } from "../Badge";
import { PoolTokenImage } from "./PoolTokenImage";

export const PoolIncentive = ({
  incentive,
  subscribedIncentiveIds,
}: {
  incentive: PoolIncentiveType;
  subscribedIncentiveIds: string[];
}) => {
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const {
    incentiveId,
    rewardToken,
    rewardTokenAddress,
    remainingRewardAmount,
    vaultItems,
  } = incentive;

  const { address } = useAccount();

  const { data } = useTokenBalance({
    id: incentive.rewardTokenAddress as Address | undefined,
    address,
  });

  const { withdrawBatch, isLoading } = useWithdrawBatch({
    vaultAddress: incentive.rewardTokenAddress as Address | undefined,
  });

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 font-medium">
        {rewardToken ? (
          <PoolTokenImage className="h-6 w-6" token={rewardToken} />
        ) : null}
        <span className="space-x-1 text-night-100">
          <span>
            {rewardToken?.symbol ?? truncateEthAddress(rewardTokenAddress)}
          </span>
          {rewardToken && vaultItems.length > 0 && (
            <span>
              <Dialog
                open={isClaimDialogOpen}
                onOpenChange={(open) => setIsClaimDialogOpen(open)}
              >
                <DialogTrigger asChild>
                  <button type="button" className="text-xs underline">
                    ({data > 0 ? "claim" : "view"} tokens)
                  </button>
                </DialogTrigger>
                <SelectionPopup
                  type="vault"
                  viewOnly={data === BigInt(0)}
                  token={rewardToken}
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
                  // requiredAmount={Number(formatEther(data))}
                />
              </Dialog>
            </span>
          )}
        </span>

        {subscribedIncentiveIds.includes(incentiveId) && (
          <Badge size="xs">Earning</Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-right">
        <span>{formatAmount(BigInt(remainingRewardAmount))}</span>
        {rewardToken?.priceUSD ? (
          <span className="text-night-400 text-sm">
            {formatUSD(
              bigIntToNumber(BigInt(remainingRewardAmount)) *
                rewardToken.priceUSD,
              { notation: "compact" },
            )}
          </span>
        ) : null}
      </div>
    </div>
  );
};
