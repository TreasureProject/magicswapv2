import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

import Table from "../Table";
import { SelectionPopup } from "../item_selection/SelectionPopup";
import { Button, TransactionButton } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import { Dialog } from "../ui/Dialog";
import { PoolImage } from "./PoolImage";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenInput } from "./PoolTokenInput";
import { useAddLiquidity } from "~/hooks/useAddLiquidity";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { useStore } from "~/hooks/useStore";
import { formatTokenAmount } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import { getAmountMin, getLpCountForTokens, quote } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { InventoryList, PoolToken } from "~/lib/tokens.server";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type {
  AddressString,
  NumberString,
  Optional,
  TroveTokenWithQuantity,
} from "~/types";

type Props = {
  pool: Pool;
  onSuccess?: () => void;
  inventory: InventoryList | null;
};

export const PoolDepositTab = ({ pool, onSuccess, inventory }: Props) => {
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

  const { isApproved: isBaseTokenApproved, refetch: refetchBaseTokenApproval } =
    useIsApproved({
      token: pool.baseToken,
      amount: amountA,
      enabled: hasAmount,
    });
  const {
    isApproved: isQuoteTokenApproved,
    refetch: refetchQuoteTokenApproval,
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
      onSuccess?.();
    }
  }, [
    isAddLiquiditySuccess,
    refetchBaseTokenBalance,
    refetchQuoteTokenBalance,
    onSuccess,
  ]);

  return (
    <div className="space-y-6">
      <Dialog>
        <SelectionPopup
          type="inventory"
          token={selectingToken}
          selectedTokens={
            selectingToken?.id === pool.baseToken.id ? nftsA : nftsB
          }
          onSubmit={(tokens) =>
            setTransaction({
              amount: tokens.length.toString(),
              nftsA: selectingToken?.id === pool.baseToken.id ? tokens : [],
              nftsB: selectingToken?.id === pool.quoteToken.id ? tokens : [],
              isExactB: false,
            })
          }
        />
        {pool.baseToken.isNFT ? (
          <PoolNftTokenInput
            token={pool.baseToken}
            selectedNfts={nftsA}
            onOpenSelect={setSelectingToken}
            inventory={inventory}
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
            selectedNfts={nftsB}
            onOpenSelect={setSelectingToken}
            inventory={inventory}
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
                ? Number(estimatedLp / (BigInt(pool.totalSupply) + estimatedLp))
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
          description="I understand there is a chance I am not be able to withdrawal and
          receive the asset I deposited. If the asset deposited in the pool is
          no longer available, I am ok receiving another asset from the
          collection."
        >
          Accept terms and conditions
        </LabeledCheckbox>
      )}
      <div className="space-y-1.5">
        {hasAmount && !isBaseTokenApproved && (
          <Button className="w-full" onClick={() => approveBaseToken?.()}>
            Approve {pool.baseToken.name}
          </Button>
        )}
        {hasAmount && !isQuoteTokenApproved && (
          <Button className="w-full" onClick={() => approveQuoteToken?.()}>
            Approve {pool.quoteToken.name}
          </Button>
        )}
        <TransactionButton
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
        </TransactionButton>
      </div>
    </div>
  );
};
