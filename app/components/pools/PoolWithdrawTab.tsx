import { useCallback, useState } from "react";
import { parseEther } from "viem";

import type { Pool } from "~/api/pools.server";
import type { TokenWithAmount } from "~/api/tokens.server";
import { useAccount } from "~/contexts/account";
import { useApproval } from "~/hooks/useApproval";
import { useRemoveLiquidity } from "~/hooks/useRemoveLiquidity";
import { getRouterContractAddress } from "~/lib/address";
import { formatAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, floorBigInt } from "~/lib/number";
import { getAmountMin, getTokenCountForLp, quote } from "~/lib/pools";
import { countTokens } from "~/lib/tokens";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type { NumberString } from "~/types";
import { SelectionPopup } from "../SelectionPopup";
import { TransactionButton } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { PoolInput } from "./PoolInput";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenImage } from "./PoolTokenImage";

type Props = {
  pool: Pool;
  balance: bigint;
  magicUsd: number;
  onSuccess?: () => void;
};

export const PoolWithdrawTab = ({
  pool,
  balance,
  magicUsd,
  onSuccess,
}: Props) => {
  const { address } = useAccount();
  const slippage = useSettingsStore((state) => state.slippage);
  const [{ amount: rawAmount, nfts0, nfts1 }, setTransaction] = useState({
    amount: "0",
    nfts0: [] as TokenWithAmount[],
    nfts1: [] as TokenWithAmount[],
  });

  const amount = parseEther(rawAmount as NumberString);
  const hasAmount = amount > 0;

  const rawAmount0 = getTokenCountForLp(
    amount,
    BigInt(pool.reserve0),
    BigInt(pool.totalSupply),
  );
  const rawAmount1 = getTokenCountForLp(
    amount,
    BigInt(pool.reserve1),
    BigInt(pool.totalSupply),
  );
  const amount0 = pool.token0.isVault ? floorBigInt(rawAmount0) : rawAmount0;
  const amount1 = pool.token1.isVault ? floorBigInt(rawAmount1) : rawAmount1;
  const amount0Min = pool.token0.isVault
    ? amount0
    : getAmountMin(amount0, slippage || DEFAULT_SLIPPAGE);
  const amount1Min = pool.token1.isVault
    ? amount1
    : getAmountMin(amount1, slippage || DEFAULT_SLIPPAGE);
  const amount0Leftover = pool.token0.isVault ? rawAmount0 - amount0 : 0n;
  const amount1Leftover = pool.token1.isVault ? rawAmount1 - amount1 : 0n;
  const amountNFTs0 = pool.token0.isVault
    ? bigIntToNumber(amount0Min, pool.token0.decimals)
    : 0;
  const amountNFTs1 = pool.token1.isVault
    ? bigIntToNumber(amount1Min, pool.token1.decimals)
    : 0;
  const priceUsd0 = bigIntToNumber(pool.token0.derivedMagic) * magicUsd;
  const priceUsd1 = bigIntToNumber(pool.token1.derivedMagic) * magicUsd;

  const { isApproved, approve } = useApproval({
    chainId: pool.chainId,
    operator: getRouterContractAddress({
      chainId: pool.chainId,
      version: pool.version,
    }),
    token: pool.address,
    amount,
    enabled: hasAmount,
  });

  const { removeLiquidity } = useRemoveLiquidity({
    pool,
    amountLP: amount,
    amount0Min,
    amount1Min,
    nfts0,
    nfts1,
    enabled: !!address && isApproved && hasAmount,
    onSuccess: useCallback(() => {
      setTransaction({ amount: "0", nfts0: [], nfts1: [] });
      onSuccess?.();
    }, [onSuccess]),
  });

  return (
    <div className="space-y-4">
      <PoolInput
        pool={pool}
        balance={balance}
        amount={rawAmount}
        onUpdateAmount={(amount) =>
          setTransaction({
            amount,
            nfts0: [],
            nfts1: [],
          })
        }
      />
      {hasAmount && (
        <>
          <div className="space-y-1.5 rounded-md border border-night-400 p-3 text-silver-400">
            <p>You'll receive at least:</p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <PoolTokenImage className="h-6 w-6" token={pool.token0} />
                <span className="text-cream">{formatAmount(amount0Min)}</span>
                {pool.token0.symbol}
              </div>
              {priceUsd0 > 0
                ? formatUSD(
                    bigIntToNumber(amount0Min, pool.token0.decimals) *
                      priceUsd0,
                  )
                : null}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <PoolTokenImage className="h-6 w-6" token={pool.token1} />
                <span className="text-cream">{formatAmount(amount1Min)}</span>
                {pool.token1.symbol}
              </div>
              {priceUsd1 > 0
                ? formatUSD(
                    bigIntToNumber(amount1Min, pool.token1.decimals) *
                      priceUsd1,
                  )
                : null}
            </div>
            {pool.isVaultVault &&
            (amount0Leftover > 0 || amount1Leftover > 0) ? (
              <>
                <p>And leftover vault tokens:</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-cream">
                      {formatAmount(amount0Leftover, {
                        decimals: pool.token0.decimals,
                      })}
                    </span>
                    v{pool.token0.symbol}
                  </div>
                  and
                  <div className="flex items-center gap-1">
                    <span className="text-cream">
                      {formatAmount(amount1Leftover, {
                        decimals: pool.token1.decimals,
                      })}
                    </span>
                    v{pool.token1.symbol}
                  </div>
                </div>
              </>
            ) : pool.hasVault && amount0Leftover > 0 ? (
              <>
                <p>And swap leftover tokens:</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <PoolTokenImage
                        className="h-6 w-6"
                        token={pool.token0.isVault ? pool.token0 : pool.token1}
                      />
                      <span className="text-cream">
                        {formatAmount(amount0Leftover)}
                      </span>
                      {pool.token0.isVault
                        ? pool.token0.symbol
                        : pool.token1.symbol}
                    </div>
                    to
                    <div className="flex items-center gap-1">
                      <PoolTokenImage
                        className="h-6 w-6"
                        token={pool.token0.isVault ? pool.token1 : pool.token0}
                      />
                      <span className="text-cream">
                        {formatAmount(
                          quote(
                            amount0Leftover,
                            pool.token0.isVault
                              ? BigInt(pool.reserve0)
                              : BigInt(pool.reserve1),
                            pool.token0.isVault
                              ? BigInt(pool.reserve1)
                              : BigInt(pool.reserve0),
                          ),
                        )}
                      </span>
                      {pool.token0.isVault
                        ? pool.token1.symbol
                        : pool.token0.symbol}
                    </div>
                  </div>
                  {formatUSD(
                    bigIntToNumber(
                      amount0Leftover,
                      pool.token0.isVault
                        ? pool.token0.decimals
                        : pool.token1.decimals,
                    ) * (pool.token0.isVault ? priceUsd0 : priceUsd1),
                  )}
                </div>
              </>
            ) : null}
          </div>
          {amountNFTs0 > 0 ? (
            <Dialog>
              <SelectionPopup
                type="vault"
                requiredAmount={amountNFTs0}
                token={pool.token0}
                selectedTokens={nfts0}
                onSubmit={(nfts0) =>
                  setTransaction((transaction) => ({
                    ...transaction,
                    nfts0,
                  }))
                }
              />
              <PoolNftTokenInput
                token={pool.token0}
                amount={amountNFTs0}
                reserve={BigInt(pool.reserve0)}
                selectedNfts={nfts0}
              />
            </Dialog>
          ) : null}
          {amountNFTs1 > 0 ? (
            <Dialog>
              <SelectionPopup
                type="vault"
                requiredAmount={amountNFTs1}
                token={pool.token1}
                selectedTokens={nfts1}
                onSubmit={(nfts1) =>
                  setTransaction((transaction) => ({
                    ...transaction,
                    nfts1,
                  }))
                }
              />
              <PoolNftTokenInput
                token={pool.token1}
                amount={amountNFTs1}
                reserve={BigInt(pool.reserve1)}
                selectedNfts={nfts1}
              />
            </Dialog>
          ) : null}
        </>
      )}
      {hasAmount && !isApproved ? (
        <TransactionButton
          className="w-full"
          size="lg"
          chainId={pool.chainId}
          onClick={() => approve?.()}
        >
          Approve MLP token
        </TransactionButton>
      ) : (
        <TransactionButton
          className="w-full"
          size="lg"
          disabled={
            !address ||
            !isApproved ||
            !hasAmount ||
            amountNFTs0 !== countTokens(nfts0) ||
            amountNFTs1 !== countTokens(nfts1)
          }
          chainId={pool.chainId}
          onClick={() => removeLiquidity?.()}
        >
          Remove liquidity
        </TransactionButton>
      )}
    </div>
  );
};
