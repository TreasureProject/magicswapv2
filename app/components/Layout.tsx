import { Link, NavLink } from "@remix-run/react";
import { MagicSwapLogo, MagicSwapLogoFull } from "@treasure-project/branding";
import { InfoIcon, MenuIcon, PlayIcon } from "lucide-react";
import { useState } from "react";

import { ConnectButton } from "./ConnectButton";
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
  { name: "Pools", href: "/pools" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [showSearchPopup, setShowSearchPopup] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <header className="container flex h-24 items-center">
        <div className="flex items-center gap-8 divide-x divide-night-700/50">
          <Link to="/">
            <MagicSwapLogoFull className="hidden h-7 md:block" />
            <MagicSwapLogo className="h-7 md:hidden" />
          </Link>
          <div className="hidden items-center lg:flex">
            {Pages.map((page) => (
              <NavLink
                prefetch="intent"
                className={({ isActive }) =>
                  cn(
                    "ml-3 cursor-pointer rounded-md px-5 py-2 font-medium text-night-400 transition-colors hover:bg-night-1000",
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
        <div className="flex flex-1 items-center justify-end gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="w-9 px-0">
                <MenuIcon className="w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  asChild
                  className="font-medium text-night-200 hover:text-night-100"
                >
                  <Link to="/swap">
                    <InfoIcon className="mr-2 h-4 w-4" />
                    <span>Swap</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="font-medium text-night-200 hover:text-night-100"
                >
                  <Link to="/pools">
                    <PlayIcon className="mr-2 h-4 w-4" />
                    <span>Pools</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Tutorials</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Articles</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Terms of Service</span>
              </DropdownMenuItem>
              <a
                href="https://commonwealth.im/treasure-dao/discussions/MagicSwap"
                target="_blank"
                rel="noreferrer"
              >
                <DropdownMenuItem>
                  <span>Governance Forum</span>
                </DropdownMenuItem>
              </a>
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
          <ConnectButton />
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
