import { MagicSwapLogo, MagicSwapLogoFull } from "@treasure-project/branding";
import { Link, NavLink } from "react-router";

import { cn } from "~/lib/utils";
import { ConnectButton } from "./ConnectButton";
import { Footer } from "./Footer";

const NAV = [
  { name: "Swap", href: "/swap" },
  { name: "Pools", href: "/pools" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-full flex-col">
      <header className="h-20 border-night-500 border-b bg-night-1000">
        <div className="container flex h-full items-center justify-between">
          <div className="flex items-center gap-3 divide-x divide-night-500 lg:gap-7">
            <Link to="/">
              <MagicSwapLogoFull className="hidden h-7 md:block" />
              <MagicSwapLogo className="h-8 md:hidden" />
            </Link>
            <div className="flex items-center">
              {NAV.map(({ name, href }) => (
                <NavLink
                  key={name}
                  prefetch="intent"
                  className={({ isActive }) =>
                    cn(
                      "ml-3 cursor-pointer rounded-md px-1 py-2 font-medium text-silver-500 transition-colors hover:text-silver-200 lg:px-5 lg:hover:bg-night-700",
                      isActive && "text-cream hover:text-cream",
                    )
                  }
                  to={href}
                >
                  {name}
                </NavLink>
              ))}
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>
      <div className="relative flex-1">{children}</div>
      <Footer />
    </div>
  );
};
