import type { Address } from "viem";

import { CONTRACT_ADDRESSES, type Contract } from "~/consts";
import type { ChainId } from "~/types";

const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

export const truncateEthAddress = (address: string) => {
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const getContractAddress = ({
  chainId,
  contract,
}: {
  chainId: number;
  contract: Contract;
}) => {
  const addresses =
    chainId in CONTRACT_ADDRESSES
      ? CONTRACT_ADDRESSES[chainId as ChainId]
      : CONTRACT_ADDRESSES[42161]; // TODO: better fallback
  return addresses[contract] as Address;
};
