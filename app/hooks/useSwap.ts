import { BigNumber } from "@ethersproject/bignumber";
import { useAccount, useWaitForTransaction } from "wagmi";

import { useSettings } from "~/contexts/settings";
import {
  useMagicSwapV2RouterSwapExactTokensForTokens,
  useMagicSwapV2RouterSwapTokensForExactTokens,
  usePrepareMagicSwapV2RouterSwapExactTokensForTokens,
  usePrepareMagicSwapV2RouterSwapTokensForExactTokens,
} from "~/generated";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString } from "~/types";

type Props = {
  tokenIn: PoolToken;
  tokenOut?: PoolToken;
  amountIn: BigNumber;
  amountOut: BigNumber;
  isExactOut: boolean;
  enabled?: boolean;
};

export const useSwap = ({
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  isExactOut,
  enabled = true,
}: Props) => {
  const { address } = useAccount();
  const { deadline } = useSettings();

  const addressArg = address ?? "0x0";
  const isEnabled = enabled && !!address && !!tokenOut;
  const deadlineBN = BigNumber.from(
    Math.floor(Date.now() / 1000) + deadline * 60
  );

  const { config: swapExactTokensForTokensConfig } =
    usePrepareMagicSwapV2RouterSwapExactTokensForTokens({
      args: [
        amountIn,
        amountOut,
        [tokenIn.id as AddressString, tokenOut?.id as AddressString],
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !isExactOut,
    });
  const {
    data: swapExactTokensForTokensData,
    write: swapExactTokensForTokens,
  } = useMagicSwapV2RouterSwapExactTokensForTokens(
    swapExactTokensForTokensConfig
  );
  const { isSuccess: isSwapExactTokensForTokensSuccess } =
    useWaitForTransaction(swapExactTokensForTokensData);

  const { config: swapTokensForExactTokensConfig } =
    usePrepareMagicSwapV2RouterSwapTokensForExactTokens({
      args: [
        amountOut,
        amountIn,
        [tokenIn.id as AddressString, tokenOut?.id as AddressString],
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && isExactOut,
    });
  const {
    data: swapTokensForExactTokensData,
    write: swapTokensForExactTokens,
  } = useMagicSwapV2RouterSwapTokensForExactTokens(
    swapTokensForExactTokensConfig
  );
  const { isSuccess: isSwapTokensForExactTokensSuccess } =
    useWaitForTransaction(swapTokensForExactTokensData);

  return {
    swap: () => {
      if (isExactOut) {
        swapTokensForExactTokens?.();
      } else {
        swapExactTokensForTokens?.();
      }
    },
    isSuccess:
      isSwapExactTokensForTokensSuccess || isSwapTokensForExactTokensSuccess,
  };
};
