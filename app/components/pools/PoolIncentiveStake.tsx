import { useCallback, useState } from "react";
import { parseEther } from "viem";

import { useAccount } from "~/contexts/account";
import { useStake } from "~/hooks/useStake";
import type { Pool } from "~/lib/pools.server";
import type { NumberString, UserIncentive } from "~/types";
import { TransactionButton } from "../ui/Button";
import { PoolInput } from "./PoolInput";

type Props = {
  pool: Pool;
  balance: bigint;
  userIncentives: UserIncentive[];
};

export const PoolIncentiveStake = ({
  pool,
  balance,
  userIncentives,
}: Props) => {
  const [rawAmount, setRawAmount] = useState("0");
  const { isConnected } = useAccount();
  const [tempUserIncentives, setUserIncentives] = useState(userIncentives);

  const amount = parseEther(rawAmount as NumberString);
  const hasAmount = amount > 0;

  const { isApproved, approve, stake } = useStake({
    pool,
    amount,
    userIncentives: tempUserIncentives,
    onSuccess: useCallback((newIncentives: UserIncentive[]) => {
      setRawAmount("0");
      setUserIncentives((curr) => curr.concat(newIncentives));
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
