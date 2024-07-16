import { HelpCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Balancer } from "react-wrap-balancer";
import { formatEther, formatUnits, parseUnits } from "viem";

import { useAccount } from "~/contexts/account";
import { useAddLiquidity } from "~/hooks/useAddLiquidity";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { useTokenBalance } from "~/hooks/useTokenBalance";
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
import { Table } from "../Table";
import { SelectionPopup } from "../item_selection/SelectionPopup";
import { TotalDisplayInner } from "../item_selection/TotalDisplayInner";
import { TransactionButton } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import { Dialog } from "../ui/Dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { PoolImage } from "./PoolImage";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenInput } from "./PoolTokenInput";

type Props = {
  pool: Pool;
  nftBalances: {
    nftBalance0: Promise<number> | undefined;
    nftBalance1: Promise<number> | undefined;
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

  const [{ amount: rawAmount, nfts0, nfts1, isExact1 }, setTransaction] =
    useState({
      amount: "0",
      nfts0: [] as TroveTokenWithQuantity[],
      nfts1: [] as TroveTokenWithQuantity[],
      isExact1: false,
    });
  const [selectingToken, setSelectingToken] = useState<Optional<PoolToken>>();
  const [checkedTerms, setCheckedTerms] = useState(false);

  const amount = parseUnits(
    rawAmount as NumberString,
    isExact1 ? pool.token1.decimals : pool.token0.decimals,
  );
  const amount0 = isExact1
    ? quote(amount, BigInt(pool.token1.reserve), BigInt(pool.token0.reserve))
    : amount;
  const amount1 = isExact1
    ? amount
    : quote(amount, BigInt(pool.token0.reserve), BigInt(pool.token1.reserve));
  const hasAmount = amount > 0;

  // Fetch balance of token0 if it's an ERC20
  const { data: balance0, refetch: refetchBalance0 } = useTokenBalance({
    id: pool.token0.id as AddressString,
    address,
    isETH: pool.token0.isETH,
    enabled: !pool.token0.isNFT,
  });

  // Fetch balance of token1 if it's an ERC20
  const { data: balance1, refetch: refetchBalance1 } = useTokenBalance({
    id: pool.token1.id as AddressString,
    address,
    isETH: pool.token1.isETH,
    enabled: !pool.token1.isNFT,
  });

  // Check for approval of token0
  const {
    isApproved: isApproved0,
    refetch: refetchApproval0,
    allowance: allowance0,
  } = useIsApproved({
    token: pool.token0,
    amount: amount0,
    enabled: hasAmount,
  });

  // Check for approval of token1
  const {
    isApproved: isApproved1,
    refetch: refetchApproval1,
    allowance: allowance1,
  } = useIsApproved({
    token: pool.token1,
    amount: amount1,
    enabled: hasAmount,
  });

  // Prep approval transaction for token0
  const { approve: approveBaseToken, isSuccess: isApproveSuccess0 } =
    useApprove({
      token: pool.token0,
      amount: amount0,
      enabled: !isApproved0,
    });

  // Prep approval transaction for token1
  const { approve: approveQuoteToken, isSuccess: isApproveSuccess1 } =
    useApprove({
      token: pool.token1,
      amount: amount1,
      enabled: !isApproved1,
    });

  const amountA = pool.token1.isNFT ? amount1 : amount0;
  const amountB = pool.token1.isNFT ? amount0 : amount1;
  const isExactB = isExact1 && !pool.token1.isNFT;
  const { addLiquidity } = useAddLiquidity({
    pool,
    tokenA: (pool.token1.isNFT
      ? pool.token1.id
      : pool.token0.id) as AddressString,
    tokenB: (pool.token1.isNFT
      ? pool.token0.id
      : pool.token1.id) as AddressString,
    amountA,
    amountB,
    amountAMin: isExactB
      ? getAmountMin(amountA, slippage || DEFAULT_SLIPPAGE)
      : amountA,
    amountBMin: isExactB
      ? amountB
      : getAmountMin(amountB, slippage || DEFAULT_SLIPPAGE),
    nftsA: pool.token1.isNFT ? nfts1 : nfts0,
    nftsB: pool.token1.isNFT ? nfts0 : nfts1,
    enabled: isApproved0 && isApproved1 && hasAmount,
    onSuccess: useCallback(() => {
      setTransaction({
        amount: "0",
        nfts0: [],
        nfts1: [],
        isExact1: false,
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
    BigInt(pool.totalSupply),
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
    ? Number.parseFloat(
        isExact1 ? formatUnits(amount0, pool.token0.decimals) : rawAmount,
      ) > Number.parseFloat(formatEther(balance0 ?? 0n))
    : false;

  const insufficientBalanceB = !pool.token1.isNFT
    ? Number.parseFloat(
        !isExact1 ? formatUnits(amount1, pool.token1.decimals) : rawAmount,
      ) > Number.parseFloat(formatEther(balance1 ?? 0n))
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
              selectingToken.id === pool.token0.id ? nfts0 : nfts1
            }
            onSubmit={(tokens) => {
              const amountTokens = countTokens(tokens);
              const isSelecting1 = selectingToken.id === pool.token1.id;
              setTransaction((curr) => {
                const amountNFTs0 = countTokens(curr.nfts0);
                const amountNFTs1 = countTokens(curr.nfts1);
                // Determine if we should treat this seleciton as a new transaction
                if (
                  (amountNFTs0 === 0 && amountNFTs1 === 0) || // user hasn't selecting anything previously
                  (isSelecting1 &&
                    amountNFTs1 > 0 &&
                    amountNFTs1 !== amountTokens) || // user previously selected NFTs B, but changed the amount
                  (!isSelecting1 &&
                    amountNFTs0 > 0 &&
                    amountNFTs0 !== amountTokens) // user previously selected NFTs A, but changed the amount
                ) {
                  return {
                    amount: amountTokens.toString(),
                    nfts0: isSelecting1 ? [] : tokens,
                    nfts1: isSelecting1 ? tokens : [],
                    isExact1: isSelecting1,
                  };
                }

                // Not a new transaction, treat this simply as an NFT selection
                const next = { ...curr };
                if (isSelecting1) {
                  next.nfts1 = tokens;
                } else {
                  next.nfts0 = tokens;
                }

                return next;
              });
            }}
          >
            {({ amount }) => {
              return (
                <TotalDisplay
                  rawAmount={amount}
                  isExact1={isExact1}
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
              isExact1
                ? bigIntToNumber(amount0, pool.token0.decimals)
                : undefined
            }
            balance={nftBalance0}
            selectedNfts={nfts0}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.token0}
            balance={balance0}
            amount={
              isExact1
                ? formatTokenAmount(amount0, pool.token0.decimals)
                : rawAmount
            }
            disabled={pool.token1.isNFT}
            onUpdateAmount={(amount) =>
              setTransaction({
                amount,
                nfts0: [],
                nfts1: [],
                isExact1: false,
              })
            }
          />
        )}
        {pool.token1.isNFT ? (
          <PoolNftTokenInput
            token={pool.token1}
            amount={
              isExact1
                ? undefined
                : bigIntToNumber(amount1, pool.token1.decimals)
            }
            balance={nftBalance1}
            selectedNfts={nfts1}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.token1}
            balance={balance1}
            amount={
              isExact1
                ? rawAmount
                : formatTokenAmount(amount1, pool.token1.decimals)
            }
            disabled={pool.token0.isNFT}
            onUpdateAmount={(amount) =>
              setTransaction({
                amount,
                nfts0: [],
                nfts1: [],
                isExact1: true,
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
              <div className="-space-x-1 flex items-center">
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
                : 0,
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
  isExact1,
}: {
  rawAmount: string;
  pool: Pool;
  isExact1: boolean;
}) => {
  const amount = parseUnits(
    rawAmount as NumberString,
    isExact1 ? pool.token1.decimals : pool.token0.decimals,
  );

  const amountA = isExact1
    ? quote(amount, BigInt(pool.token1.reserve), BigInt(pool.token0.reserve))
    : amount;
  const amountB = isExact1
    ? amount
    : quote(amount, BigInt(pool.token0.reserve), BigInt(pool.token1.reserve));

  const formattedTokenInAmount = formatTokenAmount(
    amountA,
    pool.token0.decimals,
  );
  const formattedTokenOutAmount = formatTokenAmount(
    amountB,
    pool.token1?.decimals ?? 18,
  );

  return (
    <TotalDisplayInner
      token={isExact1 ? pool.token0 : pool.token1}
      total={isExact1 ? formattedTokenInAmount : formattedTokenOutAmount}
    />
  );
};

const ApproveAgainInfoPopover = () => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        className="group ml-1"
        onClick={(e) => e.stopPropagation()}
      >
        <HelpCircle className="h-4 w-4 transition-colors group-hover:text-night-100" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="center" className="w-72 text-left">
      <p className="text-night-300 text-xs">
        <Balancer>
          You will need to approve again because the amount you entered exceeds
          the amount you previously approved.
        </Balancer>
      </p>
    </PopoverContent>
  </Popover>
);
