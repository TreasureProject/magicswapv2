import { useEffect, useState } from "react";
import { parseEther } from "viem";

import { SelectionPopup } from "../item_selection/SelectionPopup";
import { Button, TransactionButton } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { PoolInput } from "./PoolInput";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenImage } from "./PoolTokenImage";
import { useAccount } from "~/contexts/account";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { useRemoveLiquidity } from "~/hooks/useRemoveLiquidity";
import { useStore } from "~/hooks/useStore";
import { formatTokenAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, floorBigInt } from "~/lib/number";
import { getAmountMin, getTokenCountForLp, quote } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { InventoryList, PoolToken } from "~/lib/tokens.server";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type { NumberString, Optional, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  balance: bigint;
  onSuccess?: () => void;
  inventory: InventoryList | null;
};

export const PoolWithdrawTab = ({
  pool,
  balance,
  onSuccess,
  inventory,
}: Props) => {
  const { address } = useAccount();
  const slippage = useStore(useSettingsStore, (state) => state.slippage);
  const [{ amount: rawAmount, nfts }, setTransaction] = useState({
    amount: "0",
    nfts: [] as TroveTokenWithQuantity[],
  });
  const [selectingToken, setSelectingToken] = useState<Optional<PoolToken>>();

  const amount = parseEther(rawAmount as NumberString);
  const hasAmount = amount > 0;

  const rawAmountBase = getTokenCountForLp(
    amount,
    BigInt(pool.baseToken.reserveBI),
    BigInt(pool.totalSupply)
  );
  const rawAmountQuote = getTokenCountForLp(
    amount,
    BigInt(pool.quoteToken.reserveBI),
    BigInt(pool.totalSupply)
  );
  const amountBase = pool.baseToken.isNFT
    ? floorBigInt(rawAmountBase)
    : rawAmountBase;
  const amountQuote = pool.quoteToken.isNFT
    ? floorBigInt(rawAmountQuote)
    : rawAmountQuote;
  const amountBaseMin = pool.baseToken.isNFT
    ? amountBase
    : getAmountMin(amountBase, slippage || DEFAULT_SLIPPAGE);
  const amountQuoteMin = pool.quoteToken.isNFT
    ? amountQuote
    : getAmountMin(amountQuote, slippage || DEFAULT_SLIPPAGE);
  const amountLeftover = pool.baseToken.isNFT
    ? rawAmountBase - amountBase
    : pool.quoteToken.isNFT
    ? rawAmountQuote - amountQuote
    : BigInt(0);

  const { isApproved, refetch: refetchApproval } = useIsApproved({
    token: pool.id,
    amount,
    enabled: hasAmount,
  });
  const { approve, isSuccess: isApproveSuccess } = useApprove({
    token: pool.id,
    amount,
    enabled: !isApproved && hasAmount,
  });

  const { removeLiquidity, isSuccess: isRemoveLiquiditySuccess } =
    useRemoveLiquidity({
      pool,
      amountLP: amount,
      amountBaseMin,
      amountQuoteMin,
      nfts,
      enabled: !!address && isApproved && hasAmount,
    });

  useEffect(() => {
    if (isApproveSuccess) {
      refetchApproval();
    }
  }, [isApproveSuccess, refetchApproval]);

  useEffect(() => {
    if (isRemoveLiquiditySuccess) {
      setTransaction({ amount: "0", nfts: [] });
      onSuccess?.();
    }
  }, [isRemoveLiquiditySuccess, onSuccess]);

  const amountNFTs = pool.baseToken.isNFT
    ? bigIntToNumber(amountBaseMin, pool.baseToken.decimals)
    : bigIntToNumber(amountQuoteMin, pool.quoteToken.decimals);

  return (
    <div className="space-y-4">
      <PoolInput
        pool={pool}
        balance={balance}
        amount={rawAmount}
        onUpdateAmount={(amount) =>
          setTransaction({
            amount,
            nfts: [],
          })
        }
      />
      {hasAmount && (
        <>
          <div className="space-y-1.5 rounded-md border border-night-800 p-3 text-night-400">
            <p>You'll receive at least:</p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <PoolTokenImage className="h-6 w-6" token={pool.baseToken} />
                <span className="text-honey-25">
                  {formatTokenAmount(amountBaseMin)}
                </span>
                {pool.baseToken.symbol}
              </div>
              {formatUSD(
                bigIntToNumber(amountBaseMin, pool.baseToken.decimals) *
                  pool.baseToken.priceUSD
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <PoolTokenImage className="h-6 w-6" token={pool.quoteToken} />
                <span className="text-honey-25">
                  {formatTokenAmount(amountQuoteMin)}
                </span>
                {pool.quoteToken.symbol}
              </div>
              {formatUSD(
                bigIntToNumber(amountQuoteMin, pool.quoteToken.decimals) *
                  pool.quoteToken.priceUSD
              )}
            </div>
            {amountLeftover > 0 && (
              <>
                <p>And swap leftover tokens:</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <PoolTokenImage
                        className="h-6 w-6"
                        token={
                          pool.baseToken.isNFT
                            ? pool.baseToken
                            : pool.quoteToken
                        }
                      />
                      <span className="text-honey-25">
                        {formatTokenAmount(amountLeftover)}
                      </span>
                      {pool.baseToken.isNFT
                        ? pool.baseToken.symbol
                        : pool.quoteToken.symbol}
                    </div>
                    to
                    <div className="flex items-center gap-1">
                      <PoolTokenImage
                        className="h-6 w-6"
                        token={
                          pool.baseToken.isNFT
                            ? pool.quoteToken
                            : pool.baseToken
                        }
                      />
                      <span className="text-honey-25">
                        {formatTokenAmount(
                          quote(
                            amountLeftover,
                            pool.baseToken.isNFT
                              ? BigInt(pool.baseToken.reserveBI)
                              : BigInt(pool.quoteToken.reserveBI),
                            pool.baseToken.isNFT
                              ? BigInt(pool.quoteToken.reserveBI)
                              : BigInt(pool.baseToken.reserveBI)
                          )
                        )}
                      </span>
                      {pool.baseToken.isNFT
                        ? pool.quoteToken.symbol
                        : pool.baseToken.symbol}
                    </div>
                  </div>
                  {formatUSD(
                    bigIntToNumber(
                      amountLeftover,
                      pool.baseToken.isNFT
                        ? pool.baseToken.decimals
                        : pool.quoteToken.decimals
                    ) *
                      (pool.baseToken.isNFT
                        ? pool.baseToken.priceUSD
                        : pool.quoteToken.priceUSD)
                  )}
                </div>
              </>
            )}
          </div>
          {amountNFTs > 0 ? (
            <Dialog>
              <SelectionPopup
                type="vault"
                limit={amountNFTs}
                token={selectingToken}
                selectedTokens={nfts}
                onSubmit={(nfts) =>
                  setTransaction((transaction) => ({
                    ...transaction,
                    nfts,
                  }))
                }
              />
              <PoolNftTokenInput
                token={pool.baseToken.isNFT ? pool.baseToken : pool.quoteToken}
                amount={amountNFTs}
                selectedNfts={nfts}
                onOpenSelect={setSelectingToken}
                inventory={inventory}
              />
            </Dialog>
          ) : null}
        </>
      )}
      <div className="space-y-1.5">
        {hasAmount && !isApproved ? (
          <Button className="w-full" onClick={() => approve?.()}>
            Approve LP Token
          </Button>
        ) : (
          <TransactionButton
            className="w-full"
            disabled={
              !address ||
              !isApproved ||
              !hasAmount ||
              Number(amountNFTs) !== nfts.length
            }
            onClick={() => removeLiquidity?.()}
          >
            Remove Liquidity
          </TransactionButton>
        )}
      </div>
    </div>
  );
};
