import { useFetcher } from "@remix-run/react";
import type { ReactNode } from "react";
import { useContext, useEffect } from "react";
import { createContext } from "react";
import type { ConnectorData } from "wagmi";
import { useAccount as wagmiUseAccount } from "wagmi";

import type { AddressString, Optional } from "~/types";

type State = {
  isConnected: boolean;
  address: Optional<AddressString>;
  addressArg: AddressString;
};

const Context = createContext({
  isConnected: false,
  address: undefined,
  addressArg: "0x0",
} as State);

export const useAccount = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "Must call `useAccount` within an `AccountProvider` component."
    );
  }

  return context;
};

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { submit } = useFetcher();
  const { isConnected, address, connector } = wagmiUseAccount({
    onConnect: ({ address }) => {
      if (address) {
        submit({ address }, { method: "put", action: "/resources/session" });
      } else {
        submit({}, { method: "delete", action: "/resources/session" });
      }
    },
    onDisconnect: () => {
      submit({}, { method: "delete", action: "/resources/session" });
    },
  });

  useEffect(() => {
    const handleConnectorUpdate = ({ account }: ConnectorData) => {
      if (account) {
        submit(
          { address: account },
          { method: "put", action: "/resources/session" }
        );
      }
    };

    if (connector) {
      connector.on("change", handleConnectorUpdate);
    }

    return () => {
      connector?.off("change", handleConnectorUpdate);
    };
  }, [connector, submit]);

  return (
    <Context.Provider
      value={{
        isConnected,
        address,
        addressArg: address ?? "0x0",
      }}
    >
      {children}
    </Context.Provider>
  );
};
