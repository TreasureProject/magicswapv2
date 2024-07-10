import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { AlertCircle, CheckCircle } from "lucide-react";
import NProgress from "nprogress";
import { useEffect, useMemo, useState } from "react";
import { Toaster, resolveValue } from "react-hot-toast";
import { http, WagmiProvider, createConfig } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";

import { LoaderIcon } from "./components/Icons";
import { Layout } from "./components/Layout";
import { AccountProvider } from "./contexts/account";
import { ENV } from "./lib/env.server";
import { getDomainUrl } from "./lib/seo";
import { cn } from "./lib/utils";
import { useSettingsStore } from "./store/settings";
import "./styles/nprogress.css";
import "./styles/tailwind.css";

const queryClient = new QueryClient();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    requestInfo: {
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
    },
    env: {
      PUBLIC_CHAIN_ID: ENV.PUBLIC_CHAIN_ID,
      PUBLIC_THIRDWEB_CLIENT_ID: ENV.PUBLIC_THIRDWEB_CLIENT_ID,
      PUBLIC_WALLET_CONNECT_PROJECT_ID: ENV.PUBLIC_WALLET_CONNECT_PROJECT_ID,
    },
  });
};

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

export type RootLoader = typeof loader;

export default function App() {
  const { env } = useLoaderData<RootLoader>();

  const [client] = useState(() =>
    createConfig(
      getDefaultConfig({
        appName: "Magicswap",
        transports: {
          [env.PUBLIC_CHAIN_ID]: http(
            `https://${env.PUBLIC_CHAIN_ID}.rpc.thirdweb.com/${env.PUBLIC_THIRDWEB_CLIENT_ID}`,
          ),
        },
        walletConnectProjectId: env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
        chains: [
          env.PUBLIC_CHAIN_ID === arbitrumSepolia.id
            ? arbitrumSepolia
            : arbitrum,
        ],
      }),
    ),
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
    [transition.state, fetchers],
  );

  // slim loading bars on top of the page, for page transitions
  useEffect(() => {
    if (state === "loading") NProgress.start();
    if (state === "idle") NProgress.done();
  }, [state]);

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
  }, []);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#00aba9" />
        <meta name="theme-color" content="#ffffff" />
        <Meta />
        <Links />
      </head>
      <body className="h-full antialiased">
        <WagmiProvider config={client}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider theme="midnight">
              <Layout>
                <AccountProvider>
                  <Outlet />
                </AccountProvider>
              </Layout>
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={18}
          toastOptions={{ duration: Number.POSITIVE_INFINITY }}
        >
          {(t) => {
            return (
              <div
                className={cn(
                  "relative box-border w-[356px] rounded-lg border border-night-1000 bg-night-1100 shadow-lg",
                  t.visible ? "animate-toast-enter" : "animate-toast-leave",
                )}
              >
                <div className="relative p-4">
                  <div className="space-y-1 font-medium text-night-100 text-sm">
                    {resolveValue(t.message, t)}
                  </div>
                  <div className="absolute top-4 right-4 flex-shrink-0">
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
      </body>
    </html>
  );
}
