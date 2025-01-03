import { useCallback, useState } from "react";
import { parseEther } from "viem";

import { useAccount } from "~/contexts/account";
import { useUnstake } from "~/hooks/useUnstake";
import type { Pool } from "~/lib/pools.server";
import type { NumberString } from "~/types";
import { TransactionButton } from "../ui/Button";
import { PoolInput } from "./PoolInput";

type Props = {
  pool: Pool;
  staked: bigint;
  onSuccess?: () => void;
};

export const PoolIncentiveUnstake = ({ pool, staked, onSuccess }: Props) => {
  const [rawAmount, setRawAmount] = useState("0");
  const { isConnected } = useAccount();

  const amount = parseEther(rawAmount as NumberString);
  const hasAmount = amount > 0;

  const { unstake } = useUnstake({
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
        balance={staked}
        amount={rawAmount}
        isBalanceStaked
        onUpdateAmount={setRawAmount}
      />
      <TransactionButton
        className="w-full"
        size="lg"
        disabled={!isConnected || !hasAmount}
        onClick={() => unstake()}
      >
        Unstake
      </TransactionButton>
    </>
  );
};
