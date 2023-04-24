import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
import { useEffect, useState } from "react";
import { useAccount, useBalance, useWaitForTransaction } from "wagmi";

import Table from "../Table";
import { SelectionPopup } from "../item_selection/SelectionPopup";
import { Button } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import { Dialog } from "../ui/Dialog";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenInput } from "./PoolTokenInput";
import { useSettings } from "~/contexts/settings";
import {
  magicSwapV2RouterAddress,
  useErc20Allowance,
  useErc20Approve,
  useMagicSwapV2RouterAddLiquidity,
  usePrepareErc20Approve,
  usePrepareMagicSwapV2RouterAddLiquidity,
} from "~/generated";
import { formatBalance } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import { getAmountMin, getLpCountForTokens, quote } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString, Optional } from "~/types";

type Props = {
  pool: Pool;
  onSuccess?: () => void;
};

export const PoolDepositTab = ({ pool, onSuccess }: Props) => {
  const { address = "0x0" } = useAccount();
  const { slippage, deadline } = useSettings();
  const [{ amount, isExactQuote }, setTrade] = useState({
    amount: "0",
    isExactQuote: false,
  });
  const [selectingToken, setSelectingToken] = useState<Optional<PoolToken>>();
  const [checkedTerms, setCheckedTerms] = useState(false);

  const amountBase = isExactQuote
    ? quote(amount, pool.quoteToken.reserve, pool.baseToken.reserve)
    : amount;
  const amountQuote = isExactQuote
    ? amount
    : quote(amount, pool.baseToken.reserve, pool.quoteToken.reserve);

  const amountBaseBN = parseUnits(amountBase, pool.baseToken.decimals);
  const amountQuoteBN = parseUnits(amountQuote, pool.quoteToken.decimals);

  const hasAmount = amountBaseBN.gt(0);

  const { data: baseTokenBalance, refetch: refetchBaseTokenBalance } =
    useBalance({
      address,
      token: pool.baseToken.id as AddressString,
      enabled: !!address && !pool.baseToken.isNft,
    });
  const { data: quoteTokenBalance, refetch: refetchQuoteTokenBalance } =
    useBalance({
      address,
      token: pool.quoteToken.id as AddressString,
      enabled: !!address && !pool.quoteToken.isNft,
    });

  const { data: baseTokenAllowance, refetch: refetchBaseTokenAllowance } =
    useErc20Allowance({
      address: pool.baseToken.id as AddressString,
      args: [address ?? "0x0", magicSwapV2RouterAddress[421613]],
      enabled: !!address && !pool.baseToken.isNft && hasAmount,
    });
  const { data: quoteTokenAllowance, refetch: refetchQuoteTokenAllowance } =
    useErc20Allowance({
      address: pool.quoteToken.id as AddressString,
      args: [address ?? "0x0", magicSwapV2RouterAddress[421613]],
      enabled: !!address && !pool.quoteToken.isNft && hasAmount,
    });

  const isBaseTokenApproved = baseTokenAllowance?.gte(amountBaseBN) ?? false;
  const isQuoteTokenApproved = quoteTokenAllowance?.gte(amountQuoteBN) ?? false;

  const { config: approveBaseTokenConfig } = usePrepareErc20Approve({
    address: pool.baseToken.id as AddressString,
    args: [magicSwapV2RouterAddress[421613], amountBaseBN],
    enabled: !isBaseTokenApproved,
  });
  const { data: approveBaseTokenData, write: approveBaseToken } =
    useErc20Approve(approveBaseTokenConfig);
  const { isSuccess: isApproveBaseTokenSuccess } =
    useWaitForTransaction(approveBaseTokenData);

  const { data: approveQuoteTokenData, config: approveQuoteTokenConfig } =
    usePrepareErc20Approve({
      address: pool.quoteToken.id as AddressString,
      args: [magicSwapV2RouterAddress[421613], amountQuoteBN],
      enabled: !isBaseTokenApproved,
    });
  const { write: approveQuoteToken } = useErc20Approve(approveQuoteTokenConfig);
  const { isSuccess: isApproveQuoteTokenSuccess } = useWaitForTransaction(
    approveQuoteTokenData
  );

  const { config: addLiquidityConfig } =
    usePrepareMagicSwapV2RouterAddLiquidity({
      args: [
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountBaseBN,
        amountQuoteBN,
        isExactQuote
          ? parseUnits(
              getAmountMin(amountBase, slippage).toString(),
              pool.baseToken.decimals
            )
          : amountBaseBN,
        isExactQuote
          ? amountQuoteBN
          : parseUnits(
              getAmountMin(amountQuote, slippage).toString(),
              pool.quoteToken.decimals
            ),
        address ?? "0x0",
        BigNumber.from(Math.floor(Date.now() / 1000) + deadline * 60),
      ],
      enabled:
        !!address && hasAmount && isBaseTokenApproved && isQuoteTokenApproved,
    });
  const { data: addLiquidityData, write: addLiquidity } =
    useMagicSwapV2RouterAddLiquidity(addLiquidityConfig);
  const { isSuccess: isAddLiquiditySuccess } =
    useWaitForTransaction(addLiquidityData);

  const estimatedLp = getLpCountForTokens(
    amount,
    pool.baseToken.reserve,
    pool.totalSupply
  );

  const requiresTerms = pool.baseToken.isNft || pool.quoteToken.isNft;

  useEffect(() => {
    if (isApproveBaseTokenSuccess) {
      refetchBaseTokenAllowance();
    }
  }, [isApproveBaseTokenSuccess, refetchBaseTokenAllowance]);

  useEffect(() => {
    if (isApproveQuoteTokenSuccess) {
      refetchQuoteTokenAllowance();
    }
  }, [isApproveQuoteTokenSuccess, refetchQuoteTokenAllowance]);

  useEffect(() => {
    if (isAddLiquiditySuccess) {
      setTrade({
        amount: "0",
        isExactQuote: false,
      });
      refetchBaseTokenBalance();
      refetchQuoteTokenBalance();
      onSuccess?.();
    }
  }, [
    isAddLiquiditySuccess,
    refetchBaseTokenBalance,
    refetchQuoteTokenBalance,
    onSuccess,
  ]);

  console.log(selectingToken);

  return (
    <div className="space-y-4">
      <Dialog>
        {selectingToken ? <SelectionPopup token={selectingToken} /> : null}
        {pool.baseToken.isNft ? (
          <PoolNftTokenInput
            token={pool.baseToken}
            balance={baseTokenBalance?.formatted}
            amount={amountBase}
            onUpdateAmount={(amount) =>
              setTrade({ amount, isExactQuote: false })
            }
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.baseToken}
            balance={baseTokenBalance?.formatted}
            amount={amountBase}
            onUpdateAmount={(amount) =>
              setTrade({ amount, isExactQuote: false })
            }
          />
        )}
        {pool.quoteToken.isNft ? (
          <PoolNftTokenInput
            token={pool.quoteToken}
            balance={quoteTokenBalance?.formatted}
            amount={amountQuote}
            onUpdateAmount={(amount) =>
              setTrade({ amount, isExactQuote: true })
            }
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.quoteToken}
            balance={quoteTokenBalance?.formatted}
            amount={amountQuote}
            onUpdateAmount={(amount) =>
              setTrade({ amount, isExactQuote: true })
            }
          />
        )}
      </Dialog>
      <Table
        items={[
          {
            label: "Estimated LP Tokens",
            icon: {
              token0: pool.baseToken.image,
              token1: pool.quoteToken.image,
            },
            value: formatBalance(estimatedLp),
          },
          {
            label: "Share of Pool",
            value: formatPercent(
              pool.totalSupply > 0
                ? Number(estimatedLp) / (pool.totalSupply + Number(estimatedLp))
                : 0
            ),
          },
        ]}
      />
      {requiresTerms && (
        <LabeledCheckbox
          setChecked={setCheckedTerms}
          checked={checkedTerms}
          className="sm:p-4"
          id="terms"
          description="I understand there is a chance I am not be able to withdrawal and
          receive the asset I deposited. If the asset deposited in the pool is
          no longer available, I am ok receiving another asset from the
          collection."
        >
          Accept terms and conditions
        </LabeledCheckbox>
      )}
      {!isBaseTokenApproved && (
        <Button className="w-full" onClick={() => approveBaseToken?.()}>
          Approve {pool.baseToken.name}
        </Button>
      )}
      {!isQuoteTokenApproved && (
        <Button className="w-full" onClick={() => approveQuoteToken?.()}>
          Approve {pool.quoteToken.name}
        </Button>
      )}
      <Button
        className="w-full"
        disabled={
          !address ||
          !hasAmount ||
          !isBaseTokenApproved ||
          !isQuoteTokenApproved ||
          (requiresTerms && !checkedTerms)
        }
        onClick={() => addLiquidity?.()}
      >
        Add Liquidity
      </Button>
    </div>
  );
};
