import { useFetcher, useSubmit } from "@remix-run/react";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import type { ConnectorEventMap } from "wagmi";
import { useAccountEffect, useAccount as wagmiUseAccount } from "wagmi";

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
  const { isConnected, address, connector } = wagmiUseAccount();

  // TODO: Also fix this. its causing an infinite loop for now
  // useAccountEffect({
  //   onConnect: ({ address }) => {
  //     if (address) {
  //       submit({ address }, { method: "put", action: "/resources/session" });
  //     } else {
  //       submit({}, { method: "delete", action: "/resources/session" });
  //     }
  //   },
  //   onDisconnect: () => {
  //     submit({}, { method: "delete", action: "/resources/session" });
  //   },
  // });

  // TODO: fix this
  // useEffect(() => {
  //   const handleConnectorUpdate = ({
  //     accounts,
  //   }: ConnectorEventMap["change"]) => {
  //     if (accounts && accounts[0]) {
  //       submit(
  //         { address: accounts[0] },
  //         { method: "put", action: "/resources/session" }
  //       );
  //     }
  //   };

  //   if (connector) {
  //     console.log(connector);
  //     connector.emitter.on("change", handleConnectorUpdate);
  //   }

  //   return () => {
  //     connector?.emitter.off("change", handleConnectorUpdate);
  //   };
  // }, [connector, submit]);

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
