import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Balancer from "react-wrap-balancer";
import { formatEther, formatUnits, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

import Table from "../Table";
import { SelectionPopup } from "../item_selection/SelectionPopup";
import { TransactionButton } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import { Dialog } from "../ui/Dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { PoolImage } from "./PoolImage";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenInput } from "./PoolTokenInput";
import { useAddLiquidity } from "~/hooks/useAddLiquidity";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { useStore } from "~/hooks/useStore";
import { sumArray } from "~/lib/array";
import { formatTokenAmount } from "~/lib/currency";
import { bigIntToNumber, formatPercent } from "~/lib/number";
import { getAmountMin, getLpCountForTokens, quote } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { PoolToken } from "~/lib/tokens.server";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type {
  AddressString,
  NumberString,
  Optional,
  TroveTokenWithQuantity,
} from "~/types";

type Props = {
  pool: Pool;
  nftBalances: {
    nftBalance0: Promise<number> | null;
    nftBalance1: Promise<number> | null;
  };
  onSuccess?: () => void;
};

export const PoolDepositTab = ({
  pool,
  nftBalances: { nftBalance0, nftBalance1 },
  onSuccess,
}: Props) => {
  const { address } = useAccount();
  const slippage = useStore(useSettingsStore, (state) => state.slippage);
  const [{ amount: rawAmount, nftsA, nftsB, isExactB }, setTransaction] =
    useState({
      amount: "0",
      nftsA: [] as TroveTokenWithQuantity[],
      nftsB: [] as TroveTokenWithQuantity[],
      isExactB: false,
    });
  const [selectingToken, setSelectingToken] = useState<Optional<PoolToken>>();
  const [checkedTerms, setCheckedTerms] = useState(false);

  const amount = parseUnits(
    rawAmount as NumberString,
    isExactB ? pool.quoteToken.decimals : pool.baseToken.decimals
  );
  const amountA = isExactB
    ? quote(
        amount,
        BigInt(pool.quoteToken.reserveBI),
        BigInt(pool.baseToken.reserveBI)
      )
    : amount;
  const amountB = isExactB
    ? amount
    : quote(
        amount,
        BigInt(pool.baseToken.reserveBI),
        BigInt(pool.quoteToken.reserveBI)
      );
  const hasAmount = amount > 0;

  const { data: baseTokenBalance, refetch: refetchBaseTokenBalance } =
    useBalance({
      address,
      token: pool.baseToken.id as AddressString,
      enabled: !!address && !pool.baseToken.isNFT,
    });
  const { data: quoteTokenBalance, refetch: refetchQuoteTokenBalance } =
    useBalance({
      address,
      token: pool.quoteToken.id as AddressString,
      enabled: !!address && !pool.quoteToken.isNFT,
    });

  const {
    isApproved: isBaseTokenApproved,
    refetch: refetchBaseTokenApproval,
    approvedAlready: isBaseTokenApprovedAlready,
  } = useIsApproved({
    token: pool.baseToken,
    amount: amountA,
    enabled: hasAmount,
  });
  const {
    isApproved: isQuoteTokenApproved,
    refetch: refetchQuoteTokenApproval,
    approvedAlready: isQuoteTokenApprovedAlready,
  } = useIsApproved({
    token: pool.quoteToken,
    amount: amountB,
    enabled: hasAmount,
  });

  const { approve: approveBaseToken, isSuccess: isApproveBaseTokenSuccess } =
    useApprove({
      token: pool.baseToken,
      amount: amountA,
      enabled: !isBaseTokenApproved,
    });
  const { approve: approveQuoteToken, isSuccess: isApproveQuoteTokenSuccess } =
    useApprove({
      token: pool.quoteToken,
      amount: amountB,
      enabled: !isQuoteTokenApproved,
    });

  const { addLiquidity, isSuccess: isAddLiquiditySuccess } = useAddLiquidity({
    pool,
    amountBase: amountA,
    amountQuote: amountB,
    amountBaseMin: isExactB
      ? getAmountMin(amountA, slippage || DEFAULT_SLIPPAGE)
      : amountA,
    amountQuoteMin: isExactB
      ? amountB
      : getAmountMin(amountB, slippage || DEFAULT_SLIPPAGE),
    nfts: isExactB ? nftsB : nftsA,
    enabled: isBaseTokenApproved && isQuoteTokenApproved && hasAmount,
  });

  const estimatedLp = getLpCountForTokens(
    amount,
    BigInt(pool.baseToken.reserveBI),
    BigInt(pool.totalSupply)
  );

  const requiresTerms = pool.baseToken.isNFT || pool.quoteToken.isNFT;

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
      setTransaction({
        amount: "0",
        nftsA: [],
        nftsB: [],
        isExactB: false,
      });
      refetchBaseTokenBalance();
      refetchQuoteTokenBalance();
      setCheckedTerms(false);
      onSuccess?.();
    }
  }, [
    isAddLiquiditySuccess,
    refetchBaseTokenBalance,
    refetchQuoteTokenBalance,
    onSuccess,
  ]);

  const insufficientBalanceA = !pool.baseToken.isNFT
    ? parseFloat(
        isExactB ? formatUnits(amountA, pool.baseToken.decimals) : rawAmount
      ) > parseFloat(formatEther(baseTokenBalance?.value || BigInt(0)))
    : false;

  const insufficientBalanceB = !pool.quoteToken.isNFT
    ? parseFloat(
        !isExactB ? formatUnits(amountB, pool.quoteToken.decimals) : rawAmount
      ) > parseFloat(formatEther(quoteTokenBalance?.value || BigInt(0)))
    : false;

  return (
    <div className="space-y-6">
      <Dialog
        open={!!selectingToken}
        onOpenChange={(open) => {
          if (!open) {
            setSelectingToken(undefined);
          }
        }}
      >
        {selectingToken ? (
          <SelectionPopup
            type="inventory"
            token={selectingToken}
            selectedTokens={
              selectingToken?.id === pool.baseToken.id ? nftsA : nftsB
            }
            onSubmit={(tokens) =>
              setTransaction({
                amount: sumArray(
                  tokens.map(({ quantity }) => quantity)
                ).toString(),
                nftsA: selectingToken?.id === pool.baseToken.id ? tokens : [],
                nftsB: selectingToken?.id === pool.quoteToken.id ? tokens : [],
                isExactB: false,
              })
            }
          />
        ) : null}
        {pool.baseToken.isNFT ? (
          <PoolNftTokenInput
            token={pool.baseToken}
            balance={nftBalance0}
            selectedNfts={nftsA}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.baseToken}
            balance={baseTokenBalance?.value}
            amount={
              isExactB
                ? formatTokenAmount(amountA, pool.baseToken.decimals)
                : rawAmount
            }
            disabled={pool.quoteToken.isNFT}
            onUpdateAmount={(amount) =>
              setTransaction({
                amount,
                nftsA: [],
                nftsB: [],
                isExactB: false,
              })
            }
          />
        )}
        {pool.quoteToken.isNFT ? (
          <PoolNftTokenInput
            token={pool.quoteToken}
            balance={nftBalance1}
            selectedNfts={nftsB}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.quoteToken}
            balance={quoteTokenBalance?.value}
            amount={
              isExactB
                ? rawAmount
                : formatTokenAmount(amountB, pool.quoteToken.decimals)
            }
            disabled={pool.baseToken.isNFT}
            onUpdateAmount={(amount) =>
              setTransaction({
                amount,
                nftsA: [],
                nftsB: [],
                isExactB: true,
              })
            }
          />
        )}
      </Dialog>
      <Table
        items={[
          {
            label: "Estimated LP Tokens",
            value: (
              <div className="flex items-center -space-x-1">
                <PoolImage className="h-5 w-5" pool={pool} />
                <span>{formatTokenAmount(estimatedLp)}</span>
              </div>
            ),
          },
          {
            label: "Share of Pool",
            value: formatPercent(
              BigInt(pool.totalSupply) > 0
                ? bigIntToNumber(estimatedLp) /
                    (bigIntToNumber(BigInt(pool.totalSupply)) +
                      bigIntToNumber(estimatedLp))
                : 0
            ),
          },
        ]}
      />
      {requiresTerms && (
        <LabeledCheckbox
          onCheckedChange={(checked) => setCheckedTerms(Boolean(checked))}
          checked={checkedTerms}
          id="terms"
          description="I hereby acknowledge and accept the potential uncertainty regarding the retrievability of the specific asset deposited. Should the original asset become unavailable, I willingly consent to receive an alternative asset from the existing collection."
        >
          Accept terms and conditions
        </LabeledCheckbox>
      )}
      <div className="space-y-1.5">
        <TransactionButton
          className="w-full"
          size="lg"
          disabled={
            !hasAmount ||
            insufficientBalanceA ||
            insufficientBalanceB ||
            (requiresTerms && !checkedTerms)
          }
          onClick={() => {
            if (!isBaseTokenApproved) {
              return approveBaseToken?.();
            }
            if (!isQuoteTokenApproved) {
              return approveQuoteToken?.();
            }
            return addLiquidity?.();
          }}
        >
          {!hasAmount ? (
            "Enter Amount"
          ) : insufficientBalanceA || insufficientBalanceB ? (
            "Insufficient Balance"
          ) : !isBaseTokenApproved ? (
            <div className="flex items-center">
              <span>Approve {pool.baseToken.name}</span>
              {isBaseTokenApprovedAlready ? <ApproveAgainInfoPopover /> : null}
            </div>
          ) : !isQuoteTokenApproved ? (
            <div className="flex items-center">
              <span>Approve {pool.quoteToken.name}</span>
              {isQuoteTokenApprovedAlready ? <ApproveAgainInfoPopover /> : null}
            </div>
          ) : (
            "Add Liquidity"
          )}
        </TransactionButton>
      </div>
    </div>
  );
};

const ApproveAgainInfoPopover = () => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="group ml-1" onClick={(e) => e.stopPropagation()}>
        <HelpCircle className="h-4 w-4 transition-colors group-hover:text-night-100" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="center" className="w-72 text-left">
      <p className="text-xs text-night-300">
        <Balancer>
          You will need to approve again because the amount you entered exceeds
          the amount you previously approved.
        </Balancer>
      </p>
    </PopoverContent>
  </Popover>
);
