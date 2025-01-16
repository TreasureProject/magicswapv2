import { useCallback, useState } from "react";
import { parseEther } from "viem";

import { useAccount } from "~/contexts/account";
import { useStake } from "~/hooks/useStake";
import type { NumberString, Pool } from "~/types";
import { TransactionButton } from "../ui/Button";
import { PoolInput } from "./PoolInput";

type Props = {
  pool: Pool;
  balance: bigint;
  unsubscribedIncentiveIds: bigint[];
  onSuccess?: () => void;
};

export const PoolIncentiveStake = ({
  pool,
  balance,
  unsubscribedIncentiveIds,
  onSuccess,
}: Props) => {
  const [rawAmount, setRawAmount] = useState("0");
  const { isConnected } = useAccount();

  const amount = parseEther(rawAmount as NumberString);
  const hasAmount = amount > 0;

  const { isApproved, approve, stake } = useStake({
    pool,
    amount,
    onSuccess: useCallback(() => {
      setRawAmount("0");
      onSuccess?.();
    }, [onSuccess]),
  });

  return (
    <>
      <PoolInput
        pool={pool}
        balance={balance}
        amount={rawAmount}
        onUpdateAmount={setRawAmount}
      />
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
          disabled={!isConnected || !isApproved || !hasAmount}
          chainId={pool.chainId}
          onClick={() => stake(unsubscribedIncentiveIds)}
        >
          Stake
        </TransactionButton>
      )}
    </>
  );
};
