import { useCallback, useState } from "react";
import { parseEther } from "viem";

import { useAccount } from "~/contexts/account";
import { useStake } from "~/hooks/useStake";
import type { Pool } from "~/lib/pools.server";
import type { NumberString } from "~/types";
import { TransactionButton } from "../ui/Button";
import { PoolInput } from "./PoolInput";

type Props = {
  pool: Pool;
  balance: bigint;
  isSubscribed: boolean;
};

export const PoolIncentiveStake = ({
  pool,
  balance,
  isSubscribed: wasSubscribed,
}: Props) => {
  const [rawAmount, setRawAmount] = useState("0");
  const { isConnected } = useAccount();
  const [isSubscribed, setIsSubscribed] = useState(wasSubscribed);

  const amount = parseEther(rawAmount as NumberString);
  const hasAmount = amount > 0;

  const { isApproved, approve, stake } = useStake({
    pool,
    amount,
    isSubscribed,
    onSuccess: useCallback(() => {
      setRawAmount("0");
      setIsSubscribed(true);
    }, []),
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
          onClick={() => approve?.()}
        >
          Approve MLP token
        </TransactionButton>
      ) : (
        <TransactionButton
          className="w-full"
          size="lg"
          disabled={!isConnected || !isApproved || !hasAmount}
          onClick={() => stake()}
        >
          Stake
        </TransactionButton>
      )}
    </>
  );
};
