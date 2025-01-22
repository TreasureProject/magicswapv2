import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import { useFetcher } from "react-router";
import type { Address } from "viem";
import { useAccount as wagmiUseAccount } from "wagmi";

type State = {
  isConnected: boolean;
  connectedChainId: number | undefined;
  address: Address | undefined;
  addressArg: Address;
};

const Context = createContext({
  isConnected: false,
  connectedChainId: undefined,
  address: undefined,
  addressArg: "0x0",
} as State);

export const useAccount = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "Must call `useAccount` within an `AccountProvider` component.",
    );
  }

  return context;
};

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { submit } = useFetcher();
  const { isConnected, address, chainId: connectedChainId } = wagmiUseAccount();

  useEffect(() => {
    if (address) {
      submit({ address }, { method: "put", action: "/resources/session" });
    } else {
      submit({}, { method: "delete", action: "/resources/session" });
    }
  }, [address, submit]);

  return (
    <Context.Provider
      value={{
        isConnected,
        connectedChainId,
        address,
        addressArg: address ?? "0x0",
      }}
    >
      {children}
    </Context.Provider>
  );
};
