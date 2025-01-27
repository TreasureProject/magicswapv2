import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "@treasure-dev/connectkit";
import { getDefaultConfig } from "@treasure-dev/connectkit";
import { useState } from "react";
import { fallback } from "viem";
import {
  type Chain,
  arbitrum,
  arbitrumSepolia,
  treasure,
  treasureTopaz,
} from "viem/chains";
import {
  http,
  type State,
  type Transport,
  WagmiProvider,
  cookieStorage,
  createConfig,
  createStorage,
} from "wagmi";

const CHAINS_DEV = [treasureTopaz, arbitrumSepolia] as const;
const CHAINS_PROD = [treasure, arbitrum] as const;

type ConfigOptions = {
  environment: "development" | "production";
  thirdwebClientId: string;
  walletConnectProjectId: string;
};

export const getConfig = ({
  environment,
  thirdwebClientId,
  walletConnectProjectId,
}: ConfigOptions) =>
  createConfig(
    getDefaultConfig({
      transports: (environment === "development"
        ? CHAINS_DEV
        : CHAINS_PROD
      ).reduce<{
        [key in Chain["id"]]: Transport;
      }>((acc, chain) => {
        acc[chain.id] = fallback([
          http(`https://${chain.id}.rpc.thirdweb.com/${thirdwebClientId}`, {
            batch: true,
          }),
          http(undefined, { batch: true }),
        ]);
        return acc;
      }, {}),
      storage: createStorage({
        storage: cookieStorage,
      }),
      walletConnectProjectId,
      chains: environment === "development" ? CHAINS_DEV : CHAINS_PROD,
      appName: "Magicswap",
      ssr: true,
    }),
  );

export const Web3Provider = ({
  initialState,
  children,
  ...configOptions
}: {
  initialState: State | undefined;
  children: React.ReactNode;
} & ConfigOptions) => {
  const [config] = useState(() => getConfig(configOptions));
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          options={{
            enforceSupportedChains: true,
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
