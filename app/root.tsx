import { useMemo, useEffect, useState } from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useTransition,
  useFetchers,
  useLoaderData,
  ScrollRestoration,
} from "@remix-run/react";
import { Toaster } from "sonner";
import { createClient, configureChains, WagmiConfig } from "wagmi";
import { arbitrum, arbitrumGoerli } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import {
  connectorsForWallets,
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { trustWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets";
import NProgress from "nprogress";

import rainbowStyles from "@rainbow-me/rainbowkit/styles.css";
import styles from "./styles/tailwind.css";
import nProgressStyles from "./styles/nprogress.css";

import type { Env } from "./types";
import { Container } from "./components/Container";
import { Footer } from "./components/Footer";
import Navigation from "./components/Navigation";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: nProgressStyles },
  { rel: "stylesheet", href: rainbowStyles },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "MagicSwap",
  viewport: "width=device-width,initial-scale=1",
});

const strictEntries = <T extends Record<string, any>>(
  object: T
): [keyof T, T[keyof T]][] => {
  return Object.entries(object);
};

function getPublicKeys(env: Env): Env {
  const publicKeys = {} as Env;
  for (const [key, value] of strictEntries(env)) {
    if (key.startsWith("PUBLIC_")) {
      publicKeys[key] = value;
    }
  }
  return publicKeys;
}

export const loader = async () => {
  return json({
    ENV: getPublicKeys(process.env),
  });
};

export default function App({ children }: { children: React.ReactNode }) {
  const { ENV } = useLoaderData<typeof loader>();

  const [{ client, chains }] = useState(() => {
    const testChains =
      ENV.PUBLIC_ENABLE_TESTNETS === "true" ? [arbitrumGoerli] : [];

    const { chains, provider } = configureChains(
      // Configure this to chains you want
      [arbitrum, ...testChains],
      [alchemyProvider({ apiKey: ENV.PUBLIC_ALCHEMY_KEY }), publicProvider()]
    );

    const { wallets } = getDefaultWallets({
      appName: "MagicSwap",
      chains,
    });

    const connectors = connectorsForWallets([
      ...wallets,
      {
        groupName: "Others",
        wallets: [trustWallet({ chains }), ledgerWallet({ chains })],
      },
    ]);

    const client = createClient({
      autoConnect: true,
      connectors,
      provider,
    });

    return { client, chains };
  });
  const transition = useTransition();

  const fetchers = useFetchers();

  const state = useMemo<"idle" | "loading">(
    function getGlobalState() {
      const states = [
        transition.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) return "idle";
      return "loading";
    },
    [transition.state, fetchers]
  );

  // slim loading bars on top of the page, for page transitions
  useEffect(() => {
    if (state === "loading") NProgress.start();
    if (state === "idle") NProgress.done();
  }, [state, transition.state]);

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="max-w-screen m-0 box-border w-screen overflow-x-hidden p-0 text-white antialiased">
        <div className="w-full bg-night-1200 px-3 pb-16">
          <Container className="min-h-screen">
            <WagmiConfig client={client}>
              <RainbowKitProvider chains={chains} theme={darkTheme()}>
                <Navigation />
                <Outlet />
                {children}
              </RainbowKitProvider>
            </WagmiConfig>
            <Toaster richColors />
            <Scripts />
            <ScrollRestoration />
            <LiveReload />
          </Container>
        </div>
        <Footer />
      </body>
    </html>
  );
}
