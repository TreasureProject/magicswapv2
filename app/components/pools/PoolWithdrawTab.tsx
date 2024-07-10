import { useCallback, useEffect, useState } from "react";
import { parseEther } from "viem";

import { useAccount } from "~/contexts/account";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { useRemoveLiquidity } from "~/hooks/useRemoveLiquidity";
import { formatTokenAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, floorBigInt } from "~/lib/number";
import { getAmountMin, getTokenCountForLp, quote } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import { countTokens } from "~/lib/tokens";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type { NumberString, TroveTokenWithQuantity } from "~/types";
import { SelectionPopup } from "../item_selection/SelectionPopup";
import { TransactionButton } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { PoolInput } from "./PoolInput";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenImage } from "./PoolTokenImage";

type Props = {
  pool: Pool;
  balance: bigint;
  onSuccess?: () => void;
};

export const PoolWithdrawTab = ({ pool, balance, onSuccess }: Props) => {
  const { address } = useAccount();
  const slippage = useSettingsStore((state) => state.slippage);
  const [{ amount: rawAmount, nftsA, nftsB }, setTransaction] = useState({
    amount: "0",
    nftsA: [] as TroveTokenWithQuantity[],
    nftsB: [] as TroveTokenWithQuantity[],
  });

  const amount = parseEther(rawAmount as NumberString);
  const hasAmount = amount > 0;

  const rawAmountA = getTokenCountForLp(
    amount,
    BigInt(pool.token0.reserve),
    BigInt(pool.totalSupply),
  );
  const rawAmountB = getTokenCountForLp(
    amount,
    BigInt(pool.token1.reserve),
    BigInt(pool.totalSupply),
  );
  const amountA = pool.token0.isNFT ? floorBigInt(rawAmountA) : rawAmountA;
  const amountB = pool.token1.isNFT ? floorBigInt(rawAmountB) : rawAmountB;
  const amountAMin = pool.token0.isNFT
    ? amountA
    : getAmountMin(amountA, slippage || DEFAULT_SLIPPAGE);
  const amountBMin = pool.token1.isNFT
    ? amountB
    : getAmountMin(amountB, slippage || DEFAULT_SLIPPAGE);
  const amountALeftover = pool.token0.isNFT ? rawAmountA - amountA : 0n;
  const amountBLeftover = pool.token1.isNFT ? rawAmountB - amountB : 0n;
  const amountNFTsA = pool.token0.isNFT
    ? bigIntToNumber(amountAMin, pool.token0.decimals)
    : 0;
  const amountNFTsB = pool.token1.isNFT
    ? bigIntToNumber(amountBMin, pool.token1.decimals)
    : 0;

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

  const { removeLiquidity } = useRemoveLiquidity({
    pool,
    amountLP: amount,
    amountAMin,
    amountBMin,
    nftsA,
    nftsB,
    enabled: !!address && isApproved && hasAmount,
    onSuccess: useCallback(() => {
      setTransaction({ amount: "0", nftsA: [], nftsB: [] });
      onSuccess?.();
    }, [onSuccess]),
  });

  useEffect(() => {
    if (isApproveSuccess) {
      refetchApproval();
    }
  }, [isApproveSuccess, refetchApproval]);

  return (
    <div className="space-y-4">
      <PoolInput
        pool={pool}
        balance={balance}
        amount={rawAmount}
        onUpdateAmount={(amount) =>
          setTransaction({
            amount,
            nftsA: [],
            nftsB: [],
          })
        }
      />
      {hasAmount && (
        <>
          <div className="space-y-1.5 rounded-md border border-night-800 p-3 text-night-400">
            <p>You'll receive at least:</p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <PoolTokenImage className="h-6 w-6" token={pool.token0} />
                <span className="text-honey-25">
                  {formatTokenAmount(amountAMin)}
                </span>
                {pool.token0.symbol}
              </div>
              {formatUSD(
                bigIntToNumber(amountAMin, pool.token0.decimals) *
                  pool.token0.priceUSD,
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <PoolTokenImage className="h-6 w-6" token={pool.token1} />
                <span className="text-honey-25">
                  {formatTokenAmount(amountBMin)}
                </span>
                {pool.token1.symbol}
              </div>
              {formatUSD(
                bigIntToNumber(amountBMin, pool.token1.decimals) *
                  pool.token1.priceUSD,
              )}
            </div>
            {pool.isNFTNFT && (amountALeftover > 0 || amountBLeftover > 0) ? (
              <>
                <p>And leftover vault tokens:</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-honey-25">
                      {formatTokenAmount(amountALeftover, pool.token0.decimals)}
                    </span>
                    v{pool.token0.symbol}
                  </div>
                  and
                  <div className="flex items-center gap-1">
                    <span className="text-honey-25">
                      {formatTokenAmount(amountBLeftover, pool.token1.decimals)}
                    </span>
                    v{pool.token1.symbol}
                  </div>
                </div>
              </>
            ) : pool.hasNFT && amountALeftover > 0 ? (
              <>
                <p>And swap leftover tokens:</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <PoolTokenImage
                        className="h-6 w-6"
                        token={pool.token0.isNFT ? pool.token0 : pool.token1}
                      />
                      <span className="text-honey-25">
                        {formatTokenAmount(amountALeftover)}
                      </span>
                      {pool.token0.isNFT
                        ? pool.token0.symbol
                        : pool.token1.symbol}
                    </div>
                    to
                    <div className="flex items-center gap-1">
                      <PoolTokenImage
                        className="h-6 w-6"
                        token={pool.token0.isNFT ? pool.token1 : pool.token0}
                      />
                      <span className="text-honey-25">
                        {formatTokenAmount(
                          quote(
                            amountALeftover,
                            pool.token0.isNFT
                              ? BigInt(pool.token0.reserve)
                              : BigInt(pool.token1.reserve),
                            pool.token0.isNFT
                              ? BigInt(pool.token1.reserve)
                              : BigInt(pool.token0.reserve),
                          ),
                        )}
                      </span>
                      {pool.token0.isNFT
                        ? pool.token1.symbol
                        : pool.token0.symbol}
                    </div>
                  </div>
                  {formatUSD(
                    bigIntToNumber(
                      amountALeftover,
                      pool.token0.isNFT
                        ? pool.token0.decimals
                        : pool.token1.decimals,
                    ) *
                      (pool.token0.isNFT
                        ? pool.token0.priceUSD
                        : pool.token1.priceUSD),
                  )}
                </div>
              </>
            ) : null}
          </div>
          {amountNFTsA > 0 ? (
            <Dialog>
              <SelectionPopup
                type="vault"
                limit={amountNFTsA}
                token={pool.token0}
                selectedTokens={nftsA}
                onSubmit={(nftsA) =>
                  setTransaction((transaction) => ({
                    ...transaction,
                    nftsA,
                  }))
                }
              />
              <PoolNftTokenInput
                token={pool.token0}
                amount={amountNFTsA}
                reserve={BigInt(pool.token0.reserve)}
                selectedNfts={nftsA}
              />
            </Dialog>
          ) : null}
          {amountNFTsB > 0 ? (
            <Dialog>
              <SelectionPopup
                type="vault"
                limit={amountNFTsB}
                token={pool.token1}
                selectedTokens={nftsB}
                onSubmit={(nftsB) =>
                  setTransaction((transaction) => ({
                    ...transaction,
                    nftsB,
                  }))
                }
              />
              <PoolNftTokenInput
                token={pool.token1}
                amount={amountNFTsB}
                reserve={BigInt(pool.token1.reserve)}
                selectedNfts={nftsB}
              />
            </Dialog>
          ) : null}
        </>
      )}
      <div className="space-y-1.5">
        {hasAmount && !isApproved ? (
          <TransactionButton
            className="w-full"
            size="lg"
            onClick={() => approve?.()}
          >
            Approve LP Token
          </TransactionButton>
        ) : (
          <TransactionButton
            className="w-full"
            size="lg"
            disabled={
              !address ||
              !isApproved ||
              !hasAmount ||
              Number(amountNFTsA) !== countTokens(nftsA) ||
              Number(amountNFTsB) !== countTokens(nftsB)
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
