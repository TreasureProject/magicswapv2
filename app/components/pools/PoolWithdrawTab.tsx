import Decimal from "decimal.js-light";
import { useEffect, useState } from "react";
import { parseEther, parseUnits } from "viem";

import { SelectionPopup } from "../item_selection/SelectionPopup";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { PoolInput } from "./PoolInput";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenImage } from "./PoolTokenImage";
import { useAccount } from "~/contexts/account";
import { useSettings } from "~/contexts/settings";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { useRemoveLiquidity } from "~/hooks/useRemoveLiquidity";
import { formatBalance, formatUSD } from "~/lib/currency";
import { getAmountMin, getTokenCountForLp, quote } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { PoolToken } from "~/lib/tokens.server";
import type { NumberString, Optional, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  balance?: string;
  onSuccess?: () => void;
};

export const PoolWithdrawTab = ({ pool, balance = "0", onSuccess }: Props) => {
  const { address } = useAccount();
  const { slippage } = useSettings();
  const [{ amount, nfts }, setTrade] = useState({
    amount: "0",
    nfts: [] as TroveTokenWithQuantity[],
  });
  const [selectingToken, setSelectingToken] = useState<Optional<PoolToken>>();

  const amountBN = parseEther(amount as NumberString);
  const hasAmount = amountBN > 0;

  const rawAmountBase = getTokenCountForLp(
    amount,
    pool.baseToken.reserve,
    pool.totalSupply
  );
  const rawAmountQuote = getTokenCountForLp(
    amount,
    pool.quoteToken.reserve,
    pool.totalSupply
  );
  const amountBase = pool.baseToken.isNFT
    ? Math.floor(Number(rawAmountBase)).toString()
    : rawAmountBase;
  const amountQuote = pool.quoteToken.isNFT
    ? Math.floor(Number(rawAmountQuote)).toString()
    : rawAmountQuote;
  const amountBaseMin = pool.baseToken.isNFT
    ? amountBase
    : getAmountMin(amountBase, slippage).toString();
  const amountQuoteMin = pool.quoteToken.isNFT
    ? amountQuote
    : getAmountMin(amountQuote, slippage).toString();
  const amountNFTs = pool.baseToken.isNFT
    ? amountBaseMin
    : pool.quoteToken.isNFT
    ? amountQuoteMin
    : "0";
  const amountLeftover = pool.baseToken.isNFT
    ? Number(rawAmountBase) - Number(amountBase)
    : pool.quoteToken.isNFT
    ? Number(rawAmountQuote) - Number(amountQuote)
    : 0;

  const { isApproved, refetch: refetchApproval } = useIsApproved({
    token: pool.id,
    amount: amountBN,
    enabled: hasAmount,
  });
  const { approve, isSuccess: isApproveSuccess } = useApprove({
    token: pool.id,
    amount: amountBN,
    enabled: !isApproved && hasAmount,
  });

  const { removeLiquidity, isSuccess: isRemoveLiquiditySuccess } =
    useRemoveLiquidity({
      pool,
      amountLP: amountBN,
      amountBaseMin: parseUnits(
        amountBaseMin as NumberString,
        Number(pool.baseToken.decimals)
      ),
      amountQuoteMin: parseUnits(
        amountQuoteMin as NumberString,
        Number(pool.quoteToken.decimals)
      ),
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
      setTrade({ amount: "0", nfts: [] });
      onSuccess?.();
    }
  }, [isRemoveLiquiditySuccess, onSuccess]);

  const limitAmount = pool.baseToken.isNFT
    ? Number(amountBaseMin)
    : Number(amountQuoteMin);

  return (
    <div className="space-y-4">
      <PoolInput
        pool={pool}
        balance={balance}
        amount={amount}
        onUpdateAmount={(amount) =>
          setTrade({
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
                  {formatBalance(amountBaseMin)}
                </span>
                {pool.baseToken.symbol}
              </div>
              {formatUSD(
                new Decimal(amountBaseMin)
                  .mul(pool.baseToken.priceUSD)
                  .toFixed(2, Decimal.ROUND_DOWN)
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <PoolTokenImage className="h-6 w-6" token={pool.quoteToken} />
                <span className="text-honey-25">
                  {formatBalance(amountQuoteMin)}
                </span>
                {pool.quoteToken.symbol}
              </div>
              {formatUSD(
                new Decimal(amountQuoteMin)
                  .mul(pool.quoteToken.priceUSD)
                  .toFixed(2, Decimal.ROUND_DOWN)
              )}
            </div>
            {amountLeftover > 0 && (
              <>
                <p>And swap leftover NFTs:</p>
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
                        {formatBalance(amountLeftover)}
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
                        {formatBalance(
                          quote(
                            amountLeftover.toString(),
                            pool.baseToken.isNFT
                              ? pool.baseToken.reserve
                              : pool.quoteToken.reserve,
                            pool.baseToken.isNFT
                              ? pool.quoteToken.reserve
                              : pool.baseToken.reserve
                          )
                        )}
                      </span>
                      {pool.baseToken.isNFT
                        ? pool.quoteToken.symbol
                        : pool.baseToken.symbol}
                    </div>
                  </div>
                  {formatUSD(
                    new Decimal(amountLeftover)
                      .mul(
                        pool.baseToken.isNFT
                          ? pool.baseToken.priceUSD
                          : pool.quoteToken.priceUSD
                      )
                      .toFixed(2, Decimal.ROUND_DOWN)
                  )}
                </div>
              </>
            )}
          </div>
          {amountNFTs !== "0" && (
            <Dialog>
              <SelectionPopup
                type="vault"
                limit={limitAmount}
                token={selectingToken}
                selectedTokens={nfts}
                onSubmit={(nfts) =>
                  setTrade((trade) => ({
                    ...trade,
                    nfts,
                  }))
                }
              />
              <PoolNftTokenInput
                token={pool.baseToken.isNFT ? pool.baseToken : pool.quoteToken}
                amount={limitAmount}
                selectedNfts={nfts}
                onOpenSelect={setSelectingToken}
              />
            </Dialog>
          )}
        </>
      )}
      <div className="space-y-1.5">
        {hasAmount && !isApproved && (
          <Button className="w-full" onClick={() => approve?.()}>
            Approve LP Token
          </Button>
        )}
        <Button
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
        </Button>
      </div>
    </div>
  );
};
