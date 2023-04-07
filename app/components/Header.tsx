import LogoFull from "~/assets/logo-full.svg";
import Logo from "~/assets/logo.svg";
import { NavLink } from "@remix-run/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "~/lib/utils";
import { Bars3Icon as MenuIcon } from "@heroicons/react/24/outline";

export const Header = () => {
  return (
    <nav className="bg-night-900 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <NavLink to="/" className="shrink-0">
              <img
                className="h-8 w-auto sm:hidden"
                src={Logo}
                alt="MagicSwap"
              />
              <img
                className="hidden h-8 w-auto sm:block"
                src={LogoFull}
                alt="MagicSwap"
              />
            </NavLink>
            <div className="h-5 w-[1px] bg-night-800" />
            <button className="rounded-md bg-night-800 px-2 py-1.5 text-night-200 sm:hidden">
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex sm:gap-4">
              {[
                { name: "Swap", href: "/swap" },
                { name: "Pools", href: "/pools" },
              ].map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center rounded-md px-2.5 py-2 text-sm font-medium text-night-400 transition-colors hover:bg-night-800 hover:text-honey-25",
                      isActive && "text-night-100 hover:text-night-100"
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
          <ConnectButton
            showBalance={{ smallScreen: false, largeScreen: false }}
            chainStatus={{ smallScreen: "none", largeScreen: "none" }}
          />
        </div>
      </div>
    </nav>
  );
};
