import { BigNumber } from "@ethersproject/bignumber";
import { parseEther, parseUnits } from "@ethersproject/units";
import Decimal from "decimal.js-light";
import { useEffect, useState } from "react";
import { useAccount, useWaitForTransaction } from "wagmi";

import { Button } from "../ui/Button";
import { PoolInput } from "./PoolInput";
import { PoolTokenImage } from "./PoolTokenImage";
import { useSettings } from "~/contexts/settings";
import {
  magicSwapV2RouterAddress,
  useErc20Allowance,
  useErc20Approve,
  useMagicSwapV2RouterRemoveLiquidity,
  usePrepareErc20Approve,
  usePrepareMagicSwapV2RouterRemoveLiquidity,
} from "~/generated";
import { formatBalance, formatUSD } from "~/lib/currency";
import { getAmountMin, getTokenCountForLp } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { AddressString } from "~/types";

type Props = {
  pool: Pool;
  balance?: string;
  onSuccess?: () => void;
};

export const PoolWithdrawTab = ({ pool, balance = "0", onSuccess }: Props) => {
  const { address = "0x0" } = useAccount();
  const { slippage, deadline } = useSettings();
  const [amount, setAmount] = useState("0");

  const amountBN = parseEther(amount);
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

  const { data: allowance, refetch: refetchAllowance } = useErc20Allowance({
    address: pool.id as AddressString,
    args: [address ?? "0x0", magicSwapV2RouterAddress[421613]],
    enabled: !!address,
  });
  const isApproved = allowance?.gte(amountBN) ?? false;

  const { config: approveConfig } = usePrepareErc20Approve({
    address: pool.id as AddressString,
    args: [magicSwapV2RouterAddress[421613], amountBN],
    enabled: !isApproved && amountBN.gt(0),
  });
  const { data: approveData, write: approve } = useErc20Approve(approveConfig);
  const { isSuccess: isApproveSuccess } = useWaitForTransaction(approveData);

  const { config: removeLiquidityConfig } =
    usePrepareMagicSwapV2RouterRemoveLiquidity({
      args: [
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountBN,
        parseUnits(amountBaseMin, pool.baseToken.decimals),
        parseUnits(amountQuoteMin, pool.quoteToken.decimals),
        address ?? "0x0",
        BigNumber.from(Math.floor(Date.now() / 1000) + deadline * 60),
      ],
      enabled: !!address && isApproved && amountBN.gt(0),
    });
  const { data: removeLiquidityData, write: removeLiquidity } =
    useMagicSwapV2RouterRemoveLiquidity(removeLiquidityConfig);
  const { isSuccess: isRemoveLiquiditySuccess } =
    useWaitForTransaction(removeLiquidityData);

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

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
        disabled={!address || !isApproved}
        onClick={() => removeLiquidity?.()}
      >
        Remove Liquidity
      </Button>
    </div>
  );
};
