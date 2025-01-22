import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "@treasure-dev/connectkit";
import NProgress from "nprogress";
import { useEffect, useMemo, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import type { ShouldRevalidateFunction } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useLoaderData,
  useNavigation,
} from "react-router";
import { fallback } from "viem";
import { http, WagmiProvider, createConfig } from "wagmi";
import {
  arbitrum,
  arbitrumSepolia,
  treasure,
  treasureTopaz,
} from "wagmi/chains";

import type { Route } from "./+types/root";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/Toast";
import { AccountProvider } from "./contexts/account";
import { ENV } from "./lib/env.server";
import { getDomainUrl } from "./lib/seo";
import { useSettingsStore } from "./store/settings";
import stylesheet from "./styles/app.css?url";
import nProgressStylesheet from "./styles/nprogress.css?url";

const queryClient = new QueryClient();

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: nProgressStylesheet },
];

export const loader = async ({ request }: LoaderFunctionArgs) => ({
  requestInfo: {
    origin: getDomainUrl(request),
    path: new URL(request.url).pathname,
  },
  env: {
    PUBLIC_IS_DEV: ENV.PUBLIC_IS_DEV,
    PUBLIC_THIRDWEB_CLIENT_ID: ENV.PUBLIC_THIRDWEB_CLIENT_ID,
    PUBLIC_WALLET_CONNECT_PROJECT_ID: ENV.PUBLIC_WALLET_CONNECT_PROJECT_ID,
    PUBLIC_GTAG_ID: ENV.PUBLIC_GTAG_ID,
  },
});

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
          [treasure.id]: fallback([
            http(
              `https://${treasure.id}.rpc.thirdweb.com/${env.PUBLIC_THIRDWEB_CLIENT_ID}`,
              { batch: true },
            ),
            http(undefined, { batch: true }),
          ]),
          [treasureTopaz.id]: fallback([
            http(
              `https://${treasureTopaz.id}.rpc.thirdweb.com/${env.PUBLIC_THIRDWEB_CLIENT_ID}`,
              { batch: true },
            ),
            http(undefined, { batch: true }),
          ]),
          [arbitrum.id]: fallback([
            http(
              `https://${arbitrum.id}.rpc.thirdweb.com/${env.PUBLIC_THIRDWEB_CLIENT_ID}`,
              { batch: true },
            ),
            http(undefined, { batch: true }),
          ]),
          [arbitrumSepolia.id]: fallback([
            http(
              `https://${arbitrumSepolia.id}.rpc.thirdweb.com/${env.PUBLIC_THIRDWEB_CLIENT_ID}`,
              { batch: true },
            ),
            http(undefined, { batch: true }),
          ]),
        },
        walletConnectProjectId: env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
        chains: env.PUBLIC_IS_DEV
          ? [arbitrumSepolia, treasureTopaz]
          : [arbitrum, treasure],
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
        {env.PUBLIC_GTAG_ID ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-${env.PUBLIC_GTAG_ID}');`,
            }}
          />
        ) : null}
      </head>
      <body className="h-full antialiased">
        {env.PUBLIC_GTAG_ID ? (
          <noscript>
            <iframe
              title="Google Tag Manager"
              src={`https://www.googletagmanager.com/ns.html?id=GTM-${env.PUBLIC_GTAG_ID}`}
              height="0"
              width="0"
              className="invisible hidden"
            />
          </noscript>
        ) : null}
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
        <Scripts />
        <ScrollRestoration />
        <Toaster />
      </body>
    </html>
  );
}
