import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link, NavLink } from "@remix-run/react";
import { MagicSwapLogo, MagicSwapLogoFull } from "@treasure-project/branding";
import { InfoIcon, MenuIcon, PlayIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { Footer } from "./Footer";
import { DiscordIcon, TwitterIcon } from "./Icons";
import SearchPopup from "./SearchPopup";
import { Button } from "./ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/Dropdown";
import { cn } from "~/lib/utils";

const Pages = [
  { name: "Swap", href: "/swap" },
  // { name: "Tokens", href: "/tokens" },
  // { name: "NFTs", href: "/nfts" },
  { name: "Pools", href: "/pools" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [showSearchPopup, setShowSearchPopup] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <header className="container flex h-24 items-center">
        <div className="flex items-center md:gap-3">
          <Link to="/">
            <MagicSwapLogoFull className="hidden h-7 md:block" />
            <MagicSwapLogo className="h-7 md:hidden" />
          </Link>
          <button
            className="ml-3 flex items-center gap-2 rounded-lg border border-night-800 p-2 text-night-600 hover:text-night-300 md:border-none  md:p-0"
            onClick={() => setShowSearchPopup(true)}
          >
            <SearchIcon className="h-4 w-4 " />
            <p className="hidden text-sm md:block">Quick Search</p>
          </button>
          <div className="mx-3 hidden h-5 w-[1px] bg-night-700 md:mx-1.5 md:block" />

          <div className="hidden items-center lg:flex">
            {Pages.map((page) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "cursor-pointer rounded-md px-5 py-2 font-medium text-night-400 transition-colors hover:bg-night-1000",
                    isActive && "text-night-100"
                  )
                }
                to={page.href}
                key={page.name}
              >
                {page.name}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3 ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="w-9 px-0">
                <MenuIcon className="w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem className="font-medium text-night-200 hover:text-night-100">
                  <InfoIcon className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="font-medium text-night-200 hover:text-night-100">
                  <PlayIcon className="mr-2 h-4 w-4" />
                  <span>Tutorials</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Articles</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Terms of Service</span>
              </DropdownMenuItem>
              <div className="flex items-center gap-3 p-3">
                <button>
                  <DiscordIcon className="w-7 text-night-600 transition-colors hover:text-night-100" />
                </button>
                <button>
                  <TwitterIcon className="w-7 text-night-600 transition-colors hover:text-night-100" />
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <ConnectButton
            accountStatus="address"
            showBalance={{
              smallScreen: false,
              largeScreen: false,
            }}
          />
        </div>
      </header>
      <div className="relative flex-1">{children}</div>
      <Footer />
      {showSearchPopup && (
        <SearchPopup onClose={() => setShowSearchPopup(false)} />
      )}
    </div>
  );
};
