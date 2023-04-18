import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./ui/Dropdown";
import { NavLink } from "@remix-run/react";
import { MagicSwapLogoFull, MagicSwapLogo } from "@treasure-project/branding";
import { Search, Menu, Info, Play } from "lucide-react";
import { cn } from "~/lib/utils";
import SearchPopup from "./SearchPopup";
import { Button } from "./ui/Button";
import { useState } from "react";
import { Footer } from "./Footer";

const Pages = [
  { name: "Swap", href: "/" },
  { name: "Tokens", href: "/tokens" },
  { name: "NFTs", href: "/nfts" },
  { name: "Pools", href: "/pools" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [showSearchPopup, setShowSearchPopup] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <header className="container flex h-24 items-center">
        <div className="flex items-center md:gap-3">
          <MagicSwapLogoFull className="hidden h-7 md:block" />
          <MagicSwapLogo className="h-7 md:hidden" />
          <button
            className="hidden xl:block"
            onClick={() => setShowSearchPopup(true)}
          >
            <Search />
          </button>
          <div className="mx-3 h-5 w-[1px] bg-night-700 md:mx-1.5" />

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
        <div className="flex flex-1 items-center justify-end gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                <Menu className="w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Info className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
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
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="secondary">Connect Wallet</Button>
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
