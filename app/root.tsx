import NProgress from "nprogress";
import { type ReactNode, useEffect, useMemo } from "react";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useFetchers,
  useNavigation,
  useRouteLoaderData,
} from "react-router";
import { type State, cookieToInitialState } from "wagmi";

import type { Route } from "./+types/root";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Web3Provider, getConfig } from "./components/Web3Provider";
import { Button } from "./components/ui/Button";
import { Toaster } from "./components/ui/Toast";
import { AccountProvider } from "./contexts/account";
import { getContext } from "./lib/env.server";
import { getDomainUrl } from "./lib/seo";
import stylesheet from "./styles/app.css?url";
import nProgressStylesheet from "./styles/nprogress.css?url";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: nProgressStylesheet },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { env } = getContext();
  return {
    requestInfo: {
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
    },
    env: {
      PUBLIC_ENVIRONMENT: env.PUBLIC_ENVIRONMENT,
      PUBLIC_THIRDWEB_CLIENT_ID: env.PUBLIC_THIRDWEB_CLIENT_ID,
      PUBLIC_WALLET_CONNECT_PROJECT_ID: env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
      PUBLIC_GTAG_ID: env.PUBLIC_GTAG_ID,
    },
    initialState: cookieToInitialState(
      getConfig({
        environment: env.PUBLIC_ENVIRONMENT,
        thirdwebClientId: env.PUBLIC_THIRDWEB_CLIENT_ID,
        walletConnectProjectId: env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
      }),
      request.headers.get("Cookie"),
    ),
  };
};

export type RootLoader = typeof loader;
export type RootLoaderData = Awaited<ReturnType<RootLoader>>;

export const Layout = ({ children }: { children: ReactNode }) => {
  const data = useRouteLoaderData<RootLoader>("root");
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
        {data?.env.PUBLIC_GTAG_ID ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-${data.env.PUBLIC_GTAG_ID}');`,
            }}
          />
        ) : null}
      </head>
      <body className="h-full antialiased">
        {data?.env.PUBLIC_GTAG_ID ? (
          <noscript>
            <iframe
              title="Google Tag Manager"
              src={`https://www.googletagmanager.com/ns.html?id=GTM-${data.env.PUBLIC_GTAG_ID}`}
              height="0"
              width="0"
              className="invisible hidden"
            />
          </noscript>
        ) : null}
        {children}
        <Scripts />
        <ScrollRestoration />
        <Toaster />
      </body>
    </html>
  );
};

const AppLayout = ({
  isMinimal = false,
  children,
}: { isMinimal?: boolean; children: ReactNode }) => {
  const transition = useNavigation();
  const fetchers = useFetchers();
  const state = useMemo<"idle" | "loading">(
    function getGlobalState() {
      const states = [
        transition.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) {
        return "idle";
      }

      return "loading";
    },
    [transition.state, fetchers],
  );

  // slim loading bars on top of the page, for page transitions
  useEffect(() => {
    if (state === "loading") {
      NProgress.start();
    } else if (state === "idle") {
      NProgress.done();
    }
  }, [state]);

  return (
    <>
      <Header hideConnect={isMinimal} />
      {children}
      <Footer />
    </>
  );
};

export default function App({
  loaderData: { env, initialState },
}: Route.ComponentProps) {
  return (
    <Web3Provider
      environment={env.PUBLIC_ENVIRONMENT}
      thirdwebClientId={env.PUBLIC_THIRDWEB_CLIENT_ID}
      walletConnectProjectId={env.PUBLIC_WALLET_CONNECT_PROJECT_ID}
      initialState={initialState as State | undefined}
    >
      <AppLayout>
        <AccountProvider>
          <Outlet />
        </AccountProvider>
      </AppLayout>
    </Web3Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Not found" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <AppLayout isMinimal>
      <main className="container py-5 md:py-7">
        <div className="flex h-full items-center justify-center">
          <div className="w-full space-y-6 text-center">
            <div className="space-y-1">
              <h1 className="font-semibold text-xl">{message}</h1>
              <p className="text-cream">{details}</p>
              {stack && (
                <pre className="overflow-x-auto border-night-500 border-l-4 bg-night-800 p-4 text-left text-silver-300 text-sm">
                  <code>{stack}</code>
                </pre>
              )}
            </div>
            <Button size="lg">
              <Link to="/" prefetch="intent">
                Return to homepage
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
