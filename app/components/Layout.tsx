import { Link, NavLink } from "@remix-run/react";
import { MagicSwapLogo, MagicSwapLogoFull } from "@treasure-project/branding";
import { MenuIcon } from "lucide-react";

import { ConnectButton } from "./ConnectButton";
import { Footer } from "./Footer";
import { DiscordIcon, TwitterIcon } from "./Icons";
import { Button } from "./ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/Dropdown";
import {
  DISCORD_URL,
  DOCS_URL,
  GOVERNANCE_FORUM_URL,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
  TWITTER_URL,
} from "~/consts";
import { cn } from "~/lib/utils";

const Pages = [
  { name: "Swap", href: "/swap" },
  { name: "Pools", href: "/pools" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
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
          <div className="lg:hidden">
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
                    <Link to="/swap">Swap</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="font-medium text-night-200 hover:text-night-100"
                  >
                    <Link to="/pools">Pools</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <Link to={DOCS_URL} target="_blank" rel="noopener noreferrer">
                  <DropdownMenuItem>
                    <span>Documentation</span>
                  </DropdownMenuItem>
                </Link>
                <Link
                  to={TERMS_OF_SERVICE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DropdownMenuItem>
                    <span>Terms of Service</span>
                  </DropdownMenuItem>
                </Link>
                <Link
                  to={PRIVACY_POLICY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DropdownMenuItem>
                    <span>Privacy Policy</span>
                  </DropdownMenuItem>
                </Link>
                <Link
                  to={GOVERNANCE_FORUM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DropdownMenuItem>
                    <span>Governance Forum</span>
                  </DropdownMenuItem>
                </Link>
                <div className="flex items-center gap-3 p-3">
                  <Link
                    to={DISCORD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DiscordIcon className="w-7 text-night-600 transition-colors hover:text-night-100" />
                  </Link>
                  <Link
                    to={TWITTER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterIcon className="w-4 text-night-600 transition-colors hover:text-night-100" />
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ConnectButton />
        </div>
      </header>
      <div className="relative flex-1">{children}</div>
      <Footer />
    </div>
  );
};
