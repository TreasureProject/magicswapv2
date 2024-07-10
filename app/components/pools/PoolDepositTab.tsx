import { HelpCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Balancer } from "react-wrap-balancer";
import { formatEther, formatUnits, parseUnits } from "viem";

import Table from "../Table";
import { SelectionPopup } from "../item_selection/SelectionPopup";
import { TotalDisplayInner } from "../item_selection/TotalDisplayInner";
import { TransactionButton } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import { Dialog } from "../ui/Dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { PoolImage } from "./PoolImage";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenInput } from "./PoolTokenInput";
import { useAccount } from "~/contexts/account";
import { useReadErc20BalanceOf } from "~/generated";
import { useAddLiquidity } from "~/hooks/useAddLiquidity";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { formatTokenAmount } from "~/lib/currency";
import { bigIntToNumber, formatPercent } from "~/lib/number";
import { getAmountMin, getLpCountForTokens, quote } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import { countTokens } from "~/lib/tokens";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type {
  AddressString,
  NumberString,
  Optional,
  PoolToken,
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
  const slippage = useSettingsStore((state) => state.slippage);

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
    isExactB ? pool.token1.decimals : pool.token0.decimals
  );
  const amountA = isExactB
    ? quote(amount, BigInt(pool.token1.reserve), BigInt(pool.token0.reserve))
    : amount;
  const amountB = isExactB
    ? amount
    : quote(amount, BigInt(pool.token0.reserve), BigInt(pool.token1.reserve));
  const hasAmount = amount > 0;

  const { data: balance0, refetch: refetchBalance0 } = useReadErc20BalanceOf({
    address: pool.token0.id as AddressString,
    args: [address as AddressString],
    query: {
      enabled: !!address && !pool.token0.isNFT,
    },
  });
  const { data: balance1, refetch: refetchBalance1 } = useReadErc20BalanceOf({
    address: pool.token1.id as AddressString,
    args: [address as AddressString],
    query: {
      enabled: !!address && !pool.token1.isNFT,
    },
  });

  const {
    isApproved: isApproved0,
    refetch: refetchApproval0,
    allowance: allowance0,
  } = useIsApproved({
    token: pool.token0,
    amount: amountA,
    enabled: hasAmount,
  });
  const {
    isApproved: isApproved1,
    refetch: refetchApproval1,
    allowance: allowance1,
  } = useIsApproved({
    token: pool.token1,
    amount: amountB,
    enabled: hasAmount,
  });

  const { approve: approveBaseToken, isSuccess: isApproveSuccess0 } =
    useApprove({
      token: pool.token0,
      amount: amountA,
      enabled: !isApproved0,
    });
  const { approve: approveQuoteToken, isSuccess: isApproveSuccess1 } =
    useApprove({
      token: pool.token1,
      amount: amountB,
      enabled: !isApproved1,
    });

  const { addLiquidity } = useAddLiquidity({
    pool,
    amountA,
    amountB,
    amountAMin: isExactB
      ? getAmountMin(amountA, slippage || DEFAULT_SLIPPAGE)
      : amountA,
    amountBMin: isExactB
      ? amountB
      : getAmountMin(amountB, slippage || DEFAULT_SLIPPAGE),
    nftsA,
    nftsB,
    enabled: isApproved0 && isApproved1 && hasAmount,
    onSuccess: useCallback(() => {
      setTransaction({
        amount: "0",
        nftsA: [],
        nftsB: [],
        isExactB: false,
      });
      refetchBalance0();
      refetchBalance1();
      setCheckedTerms(false);
      onSuccess?.();
    }, [onSuccess, refetchBalance0, refetchBalance1]),
  });

  const estimatedLp = getLpCountForTokens(
    amount,
    BigInt(pool.token0.reserve),
    BigInt(pool.totalSupply)
  );

  useEffect(() => {
    if (isApproveSuccess0) {
      refetchApproval0();
    }
  }, [isApproveSuccess0, refetchApproval0]);

  useEffect(() => {
    if (isApproveSuccess1) {
      refetchApproval1();
    }
  }, [isApproveSuccess1, refetchApproval1]);

  const insufficientBalanceA = !pool.token0.isNFT
    ? parseFloat(
        isExactB ? formatUnits(amountA, pool.token0.decimals) : rawAmount
      ) > parseFloat(formatEther(balance0 ?? 0n))
    : false;

  const insufficientBalanceB = !pool.token1.isNFT
    ? parseFloat(
        !isExactB ? formatUnits(amountB, pool.token1.decimals) : rawAmount
      ) > parseFloat(formatEther(balance1 ?? 0n))
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
              selectingToken.id === pool.token0.id ? nftsA : nftsB
            }
            onSubmit={(tokens) => {
              const amountTokens = countTokens(tokens);
              const isSelectingB = selectingToken.id === pool.token1.id;
              setTransaction((curr) => {
                const amountNFTsA = countTokens(curr.nftsA);
                const amountNFTsB = countTokens(curr.nftsB);
                // Determine if we should treat this seleciton as a new transaction
                if (
                  (amountNFTsA === 0 && amountNFTsB === 0) || // user hasn't selecting anything previously
                  (isSelectingB &&
                    amountNFTsB > 0 &&
                    amountNFTsB !== amountTokens) || // user previously selected NFTs B, but changed the amount
                  (!isSelectingB &&
                    amountNFTsA > 0 &&
                    amountNFTsA !== amountTokens) // user previously selected NFTs A, but changed the amount
                ) {
                  return {
                    amount: amountTokens.toString(),
                    nftsA: isSelectingB ? [] : tokens,
                    nftsB: isSelectingB ? tokens : [],
                    isExactB: isSelectingB,
                  };
                }

                // Not a new transaction, treat this simply as an NFT selection
                const next = { ...curr };
                if (isSelectingB) {
                  next.nftsB = tokens;
                } else {
                  next.nftsA = tokens;
                }

                return next;
              });
            }}
          >
            {({ amount }) => {
              return (
                <TotalDisplay
                  rawAmount={amount}
                  isExactB={isExactB}
                  pool={pool}
                />
              );
            }}
          </SelectionPopup>
        ) : null}
        {pool.token0.isNFT ? (
          <PoolNftTokenInput
            token={pool.token0}
            amount={
              isExactB
                ? bigIntToNumber(amountA, pool.token0.decimals)
                : undefined
            }
            balance={nftBalance0}
            selectedNfts={nftsA}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.token0}
            balance={balance0}
            amount={
              isExactB
                ? formatTokenAmount(amountA, pool.token0.decimals)
                : rawAmount
            }
            disabled={pool.token1.isNFT}
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
        {pool.token1.isNFT ? (
          <PoolNftTokenInput
            token={pool.token1}
            amount={
              isExactB
                ? undefined
                : bigIntToNumber(amountB, pool.token1.decimals)
            }
            balance={nftBalance1}
            selectedNfts={nftsB}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.token1}
            balance={balance1}
            amount={
              isExactB
                ? rawAmount
                : formatTokenAmount(amountB, pool.token1.decimals)
            }
            disabled={pool.token0.isNFT}
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
      {pool.hasNFT && (
        <LabeledCheckbox
          onCheckedChange={(checked) => setCheckedTerms(Boolean(checked))}
          checked={checkedTerms}
          className="rounded-md border border-night-800 bg-night-1100/50 p-4"
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
            (pool.hasNFT && !checkedTerms)
          }
          onClick={() => {
            if (!isApproved0) {
              return approveBaseToken?.();
            }

            if (!isApproved1) {
              return approveQuoteToken?.();
            }

            return addLiquidity?.();
          }}
        >
          {!hasAmount ? (
            "Enter amount"
          ) : insufficientBalanceA || insufficientBalanceB ? (
            "Insufficient balance"
          ) : !isApproved0 ? (
            <div className="flex items-center">
              <span>Approve {pool.token0.name}</span>
              {allowance0 > 0n ? <ApproveAgainInfoPopover /> : null}
            </div>
          ) : !isApproved1 ? (
            <div className="flex items-center">
              <span>Approve {pool.token1.name}</span>
              {allowance1 > 0n ? <ApproveAgainInfoPopover /> : null}
            </div>
          ) : (
            "Add liquidity"
          )}
        </TransactionButton>
      </div>
    </div>
  );
};

const TotalDisplay = ({
  rawAmount,
  pool,
  isExactB,
}: {
  rawAmount: string;
  pool: Pool;
  isExactB: boolean;
}) => {
  const amount = parseUnits(
    rawAmount as NumberString,
    isExactB ? pool.token1.decimals : pool.token0.decimals
  );

  const amountA = isExactB
    ? quote(amount, BigInt(pool.token1.reserve), BigInt(pool.token0.reserve))
    : amount;
  const amountB = isExactB
    ? amount
    : quote(amount, BigInt(pool.token0.reserve), BigInt(pool.token1.reserve));

  const formattedTokenInAmount = formatTokenAmount(
    amountA,
    pool.token0.decimals
  );
  const formattedTokenOutAmount = formatTokenAmount(
    amountB,
    pool.token1?.decimals ?? 18
  );

  return (
    <TotalDisplayInner
      token={isExactB ? pool.token0 : pool.token1}
      total={isExactB ? formattedTokenInAmount : formattedTokenOutAmount}
    />
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
