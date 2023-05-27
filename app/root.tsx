import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/react";
import { useNavigation } from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useLoaderData,
} from "@remix-run/react";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { AlertCircle, CheckCircle } from "lucide-react";
import NProgress from "nprogress";
import { useEffect, useMemo, useState } from "react";
import { Toaster, resolveValue } from "react-hot-toast";
import { WagmiConfig, createConfig } from "wagmi";
import { arbitrum, arbitrumGoerli } from "wagmi/chains";

import { LoaderIcon } from "./components/Icons";
import { Layout } from "./components/Layout";
import { AccountProvider } from "./contexts/account";
import { SettingsProvider } from "./contexts/settings";
import { getDomainUrl } from "./lib/seo";
import { cn } from "./lib/utils";
import nProgressStyles from "./styles/nprogress.css";
import styles from "./styles/tailwind.css";
import type { Env } from "./types";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: nProgressStyles },
];

export const meta: V2_MetaFunction = () => [
  { title: "Magicswap" },
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const loader = async ({ request }: LoaderArgs) => {
  return json({
    ENV: getPublicKeys(process.env),
    requestInfo: {
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
    },
  });
};

export type RootLoader = typeof loader;

export default function App() {
  const { ENV } = useLoaderData<typeof loader>();

  const [client] = useState(() =>
    createConfig(
      getDefaultConfig({
        appName: "Magicswap",
        alchemyId: ENV.PUBLIC_ALCHEMY_KEY,
        walletConnectProjectId: ENV.PUBLIC_WALLET_CONNECT_KEY,
        chains: [
          ...(ENV.PUBLIC_ENABLE_TESTNETS === "true" ? [arbitrumGoerli] : []),
          arbitrum,
        ],
      })
    )
  );

  const transition = useNavigation();

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
      <body className="h-full antialiased">
        <WagmiConfig config={client}>
          <ConnectKitProvider>
            <Layout>
              <AccountProvider>
                <SettingsProvider>
                  <Outlet />
                </SettingsProvider>
              </AccountProvider>
            </Layout>
          </ConnectKitProvider>
        </WagmiConfig>
        <Toaster position="top-right" reverseOrder={false} gutter={18}>
          {(t) => {
            return (
              <div
                className={cn(
                  "relative box-border w-[356px] rounded-lg border border-night-1000 bg-night-1100 shadow-lg",
                  t.visible ? "animate-toast-enter" : "animate-toast-leave"
                )}
              >
                <div className="relative p-4">
                  <div className="text-sm text-white">
                    {resolveValue(t.message, t)}
                  </div>
                  <div className="absolute right-4 top-4 flex-shrink-0">
                    {(() => {
                      switch (t.type) {
                        case "success":
                          return (
                            <CheckCircle className="h-4 w-4 text-success-300" />
                          );
                        case "error":
                          return (
                            <AlertCircle className="h-4 w-4 text-ruby-900" />
                          );
                        case "loading":
                          return (
                            <LoaderIcon className="h-4 w-4 animate-spin text-sapphire-500" />
                          );
                        default:
                          return (
                            <CheckCircle className="h-4 w-4 text-yellow-500" />
                          );
                      }
                    })()}
                  </div>
                </div>
              </div>
            );
          }}
        </Toaster>
        <Scripts />
        <ScrollRestoration />
        <LiveReload />
      </body>
    </html>
  );
}
