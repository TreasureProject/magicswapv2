import { parseEther, parseUnits } from "@ethersproject/units";
import Decimal from "decimal.js-light";
import { useEffect, useState } from "react";

import { Button } from "../ui/Button";
import { PoolInput } from "./PoolInput";
import { PoolTokenImage } from "./PoolTokenImage";
import { useAccount } from "~/contexts/account";
import { useSettings } from "~/contexts/settings";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { useRemoveLiquidity } from "~/hooks/useRemoveLiquidity";
import { formatBalance, formatUSD } from "~/lib/currency";
import { getAmountMin, getTokenCountForLp } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";

type Props = {
  pool: Pool;
  balance?: string;
  onSuccess?: () => void;
};

export const PoolWithdrawTab = ({ pool, balance = "0", onSuccess }: Props) => {
  const { address } = useAccount();
  const { slippage } = useSettings();
  const [amount, setAmount] = useState("0");

  const amountBN = parseEther(amount);
  const hasAmount = amountBN.gt(0);

  const amountBase = getTokenCountForLp(
    amount,
    pool.baseToken.reserve,
    pool.totalSupply
  );
  const amountQuote = getTokenCountForLp(
    amount,
    pool.quoteToken.reserve,
    pool.totalSupply
  );
  const amountBaseMin = getAmountMin(amountBase, slippage).toString();
  const amountQuoteMin = getAmountMin(amountQuote, slippage).toString();

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
      amountBaseMin: parseUnits(amountBaseMin, pool.baseToken.decimals),
      amountQuoteMin: parseUnits(amountQuoteMin, pool.quoteToken.decimals),
      nfts: [],
      enabled: !!address && isApproved && hasAmount,
    });

  useEffect(() => {
    if (isApproveSuccess) {
      refetchApproval();
    }
  }, [isApproveSuccess, refetchApproval]);

  useEffect(() => {
    if (isRemoveLiquiditySuccess) {
      setAmount("0");
      onSuccess?.();
    }
  }, [isRemoveLiquiditySuccess, onSuccess]);

  return (
    <div className="space-y-4">
      <PoolInput
        pool={pool}
        balance={balance}
        amount={amount}
        onUpdateAmount={setAmount}
      />
      {amount !== "0" && (
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
              new Decimal(amountBaseMin === "0" ? 1 : amountBaseMin)
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
              new Decimal(amountQuoteMin === "0" ? 1 : amountQuoteMin)
                .mul(pool.quoteToken.priceUSD)
                .toFixed(2, Decimal.ROUND_DOWN)
            )}
          </div>
        </div>
      )}
      {!isApproved && (
        <Button className="w-full" onClick={() => approve?.()}>
          Approve LP Token
        </Button>
      )}
      <Button
        className="w-full"
        disabled={!address || !isApproved || !hasAmount}
        onClick={() => removeLiquidity?.()}
      >
        Remove Liquidity
      </Button>
    </div>
  );
};
