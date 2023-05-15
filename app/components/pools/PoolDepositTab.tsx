import { parseUnits } from "@ethersproject/units";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";

import Table from "../Table";
import { SelectionPopup } from "../item_selection/SelectionPopup";
import { Button } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import { Dialog } from "../ui/Dialog";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenInput } from "./PoolTokenInput";
import { useSettings } from "~/contexts/settings";
import { useAddLiquidity } from "~/hooks/useAddLiquidity";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { formatBalance } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import { getAmountMin, getLpCountForTokens, quote } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString, Optional, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  onSuccess?: () => void;
};

export const PoolDepositTab = ({ pool, onSuccess }: Props) => {
  const { address } = useAccount();
  const { slippage } = useSettings();
  const [{ amount, baseNfts, quoteNfts, isExactQuote }, setTrade] = useState({
    amount: "0",
    baseNfts: [] as TroveTokenWithQuantity[],
    quoteNfts: [] as TroveTokenWithQuantity[],
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

  const { isApproved: isBaseTokenApproved, refetch: refetchBaseTokenApproval } =
    useIsApproved({
      token: pool.baseToken,
      amount: amountBaseBN,
      enabled: hasAmount,
    });
  const {
    isApproved: isQuoteTokenApproved,
    refetch: refetchQuoteTokenApproval,
  } = useIsApproved({
    token: pool.quoteToken,
    amount: amountQuoteBN,
    enabled: hasAmount,
  });

  const { approve: approveBaseToken, isSuccess: isApproveBaseTokenSuccess } =
    useApprove({
      token: pool.baseToken,
      amount: amountBaseBN,
      enabled: !isBaseTokenApproved,
    });
  const { approve: approveQuoteToken, isSuccess: isApproveQuoteTokenSuccess } =
    useApprove({
      token: pool.quoteToken,
      amount: amountQuoteBN,
      enabled: !isQuoteTokenApproved,
    });

  const { addLiquidity, isSuccess: isAddLiquiditySuccess } = useAddLiquidity({
    pool,
    amountBase: amountBaseBN,
    amountQuote: amountQuoteBN,
    amountBaseMin: isExactQuote
      ? parseUnits(
          getAmountMin(amountBase, slippage).toString(),
          pool.baseToken.decimals
        )
      : amountBaseBN,
    amountQuoteMin: isExactQuote
      ? amountQuoteBN
      : parseUnits(
          getAmountMin(amountQuote, slippage).toString(),
          pool.quoteToken.decimals
        ),
    nfts: baseNfts,
    enabled: isBaseTokenApproved && isQuoteTokenApproved && hasAmount,
  });

  const estimatedLp = getLpCountForTokens(
    amount,
    pool.baseToken.reserve,
    pool.totalSupply
  );

  const requiresTerms = pool.baseToken.isNft || pool.quoteToken.isNft;

  useEffect(() => {
    if (isApproveBaseTokenSuccess) {
      refetchBaseTokenApproval();
    }
  }, [isApproveBaseTokenSuccess, refetchBaseTokenApproval]);

  useEffect(() => {
    if (isApproveQuoteTokenSuccess) {
      refetchQuoteTokenApproval();
    }
  }, [isApproveQuoteTokenSuccess, refetchQuoteTokenApproval]);

  useEffect(() => {
    if (isAddLiquiditySuccess) {
      setTrade({
        amount: "0",
        baseNfts: [],
        quoteNfts: [],
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

  return (
    <div className="space-y-4">
      <Dialog>
        <SelectionPopup
          type="inventory"
          token={selectingToken}
          selectedTokens={
            selectingToken?.id === pool.baseToken.id ? baseNfts : quoteNfts
          }
          onSubmit={(tokens) =>
            setTrade({
              amount: tokens.length.toString(),
              baseNfts: selectingToken?.id === pool.baseToken.id ? tokens : [],
              quoteNfts:
                selectingToken?.id === pool.quoteToken.id ? tokens : [],
              isExactQuote: false,
            })
          }
        />
        {pool.baseToken.isNft ? (
          <PoolNftTokenInput
            token={pool.baseToken}
            balance="0"
            selectedNfts={baseNfts}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.baseToken}
            balance={baseTokenBalance?.formatted}
            amount={isExactQuote ? formatBalance(amountBase) : amountBase}
            disabled={pool.quoteToken.isNft}
            onUpdateAmount={(amount) =>
              setTrade({
                amount,
                baseNfts: [],
                quoteNfts: [],
                isExactQuote: false,
              })
            }
          />
        )}
        {pool.quoteToken.isNft ? (
          <PoolNftTokenInput
            token={pool.quoteToken}
            balance="0"
            selectedNfts={quoteNfts}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.quoteToken}
            balance={quoteTokenBalance?.formatted}
            amount={isExactQuote ? amountQuote : formatBalance(amountQuote)}
            disabled={pool.baseToken.isNft}
            onUpdateAmount={(amount) =>
              setTrade({
                amount,
                baseNfts: [],
                quoteNfts: [],
                isExactQuote: true,
              })
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
          onCheckedChange={(checked) => setCheckedTerms(Boolean(checked))}
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
