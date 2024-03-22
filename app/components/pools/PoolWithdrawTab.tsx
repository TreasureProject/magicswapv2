import { useEffect, useState } from "react";
import { parseEther } from "viem";

import { SelectionPopup } from "../item_selection/SelectionPopup";
import { TransactionButton } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { PoolInput } from "./PoolInput";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenImage } from "./PoolTokenImage";
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
    BigInt(pool.baseToken.reserve),
    BigInt(pool.totalSupply)
  );
  const rawAmountB = getTokenCountForLp(
    amount,
    BigInt(pool.quoteToken.reserve),
    BigInt(pool.totalSupply)
  );
  const amountA = pool.baseToken.isNFT ? floorBigInt(rawAmountA) : rawAmountA;
  const amountB = pool.quoteToken.isNFT ? floorBigInt(rawAmountB) : rawAmountB;
  const amountAMin = pool.baseToken.isNFT
    ? amountA
    : getAmountMin(amountA, slippage || DEFAULT_SLIPPAGE);
  const amountBMin = pool.quoteToken.isNFT
    ? amountB
    : getAmountMin(amountB, slippage || DEFAULT_SLIPPAGE);
  const amountALeftover = pool.baseToken.isNFT
    ? rawAmountA - amountA
    : BigInt(0);
  const amountBLeftover = pool.quoteToken.isNFT
    ? rawAmountB - amountB
    : BigInt(0);
  const amountNFTsA = pool.baseToken.isNFT
    ? bigIntToNumber(amountAMin, pool.baseToken.decimals)
    : 0;
  const amountNFTsB = pool.quoteToken.isNFT
    ? bigIntToNumber(amountBMin, pool.quoteToken.decimals)
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
    onSuccess: () => {
      setTransaction({ amount: "0", nftsA: [], nftsB: [] });
      onSuccess?.();
    },
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
                <PoolTokenImage className="h-6 w-6" token={pool.baseToken} />
                <span className="text-honey-25">
                  {formatTokenAmount(amountAMin)}
                </span>
                {pool.baseToken.symbol}
              </div>
              {formatUSD(
                bigIntToNumber(amountAMin, pool.baseToken.decimals) *
                  pool.baseToken.priceUSD
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <PoolTokenImage className="h-6 w-6" token={pool.quoteToken} />
                <span className="text-honey-25">
                  {formatTokenAmount(amountBMin)}
                </span>
                {pool.quoteToken.symbol}
              </div>
              {formatUSD(
                bigIntToNumber(amountBMin, pool.quoteToken.decimals) *
                  pool.quoteToken.priceUSD
              )}
            </div>
            {pool.isNFTNFT && (amountALeftover > 0 || amountBLeftover > 0) ? (
              <>
                <p>And leftover vault tokens:</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-honey-25">
                      {formatTokenAmount(
                        amountALeftover,
                        pool.baseToken.decimals
                      )}
                    </span>
                    v{pool.baseToken.symbol}
                  </div>
                  and
                  <div className="flex items-center gap-1">
                    <span className="text-honey-25">
                      {formatTokenAmount(
                        amountBLeftover,
                        pool.quoteToken.decimals
                      )}
                    </span>
                    v{pool.quoteToken.symbol}
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
                        token={
                          pool.baseToken.isNFT
                            ? pool.baseToken
                            : pool.quoteToken
                        }
                      />
                      <span className="text-honey-25">
                        {formatTokenAmount(amountALeftover)}
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
                            amountALeftover,
                            pool.baseToken.isNFT
                              ? BigInt(pool.baseToken.reserve)
                              : BigInt(pool.quoteToken.reserve),
                            pool.baseToken.isNFT
                              ? BigInt(pool.quoteToken.reserve)
                              : BigInt(pool.baseToken.reserve)
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
                      amountALeftover,
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
            ) : null}
          </div>
          {amountNFTsA > 0 ? (
            <Dialog>
              <SelectionPopup
                type="vault"
                limit={amountNFTsA}
                token={pool.baseToken}
                selectedTokens={nftsA}
                onSubmit={(nftsA) =>
                  setTransaction((transaction) => ({
                    ...transaction,
                    nftsA,
                  }))
                }
              />
              <PoolNftTokenInput
                token={pool.baseToken}
                amount={amountNFTsA}
                reserve={BigInt(pool.baseToken.reserve)}
                selectedNfts={nftsA}
              />
            </Dialog>
          ) : null}
          {amountNFTsB > 0 ? (
            <Dialog>
              <SelectionPopup
                type="vault"
                limit={amountNFTsB}
                token={pool.quoteToken}
                selectedTokens={nftsB}
                onSubmit={(nftsB) =>
                  setTransaction((transaction) => ({
                    ...transaction,
                    nftsB,
                  }))
                }
              />
              <PoolNftTokenInput
                token={pool.quoteToken}
                amount={amountNFTsB}
                reserve={BigInt(pool.quoteToken.reserve)}
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
