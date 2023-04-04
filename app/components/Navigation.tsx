import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { MagicSwapLogo, MagicSwapLogoFull } from "~/assets/Svgs";
import { Search } from "./Search";
import { Button } from "../primitives/Button";
import { Dropdown, HamburgerDropdown } from "./Dropdown";
import {
  ArbitrumIcom,
  DiscordIcon,
  InfoIcon,
  PlayIcon,
  TwitterIcon,
} from "~/assets/Icons";
import { HamburgerIcon } from "~/primitives/HamburgerIcon";
import { media, documentation } from "~/consts";
import PopupOverlay from "~/primitives/PopupOverlay";
import SearchPopup from "./popups/SearchPopup";
import Input from "~/primitives/Input";

const Pages = [
  { name: "Swap", href: "/" },
  { name: "Tokens", href: "/tokens" },
  { name: "NFTs", href: "/nfts" },
  { name: "Pools", href: "/pools" },
];

const MobileNav = () => {
  return (
    <div className="pt fixed left-0 top-[70px] z-[200] h-[calc(100vh-70px)] w-screen border-t border-base-900 bg-base-1200 p-4 pt-8">
      <p>Content goes here</p>
    </div>
  );
};

const Navigation = () => {
  const activePath = useLocation().pathname;
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const switchChain = (chain: string) => {
    console.log(chain);
  };

  return (
    <div className="flex w-full items-center justify-between py-4">
      {showSearchPopup && (
        <SearchPopup onClose={() => setShowSearchPopup(false)} />
      )}
      {showMobileNav && <MobileNav />}
      <div className="flex items-center md:gap-3">
        <MagicSwapLogoFull className="hidden h-7 md:block" />
        <MagicSwapLogo className="h-7 md:hidden" />
        <div
          className="hidden xl:block"
          onClick={() => setShowSearchPopup(true)}
        >
          <Search />
        </div>
        <div className="mx-3 h-5 w-[1px] bg-base-700 md:mx-1.5" />
        <HamburgerIcon
          onClick={() => setShowMobileNav(!showMobileNav)}
          open={false}
          className="lg:hidden"
        />
        <div className="hidden items-center lg:flex">
          {Pages.map((page) => (
            <Link
              className={twMerge(
                "cursor-pointer rounded-md px-5 py-2 font-medium text-base-400 transition-colors hover:bg-base-1000",
                activePath === page.href && "text-base-100"
              )}
              to={page.href}
              key={page.name}
            >
              {page.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <HamburgerDropdown className="hidden lg:block">
          <div className="my-2 flex flex-col gap-3 p-2 text-base-500 transition-colors">
            <a
              className="flex items-center gap-1 px-2 hover:text-base-100"
              href={documentation.documentation}
              target="_blank"
              rel="noreferrer"
            >
              <InfoIcon className="w-5 " />
              <p className="text-md font-medium leading-[160%]">
                Documentation
              </p>
            </a>
            <a
              className="flex items-center gap-1 px-2 hover:text-base-100"
              href={documentation.documentation}
              target="_blank"
              rel="noreferrer"
            >
              <PlayIcon className="w-5 " />
              <p className="text-md font-medium leading-[160%]">Tutorials</p>
            </a>
          </div>
          <div className=" h-[1px] w-full border-b border-base-800 bg-base-1200" />
          <div className="flex flex-col gap-1 p-2">
            <a
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-900"
              href={media.github}
              target="_blank"
              rel="noreferrer"
            >
              Github
            </a>
            <a
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-900"
              href={media.substack}
              target="_blank"
              rel="noreferrer"
            >
              Articles
            </a>
            <a
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-900"
              href={documentation.documentation}
              target="_blank"
              rel="noreferrer"
            >
              Documentation
            </a>
            <a
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-900"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Service
            </a>
            <div className="flex items-center">
              <a
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-900"
                href={media.twitter}
                target="_blank"
                rel="noreferrer"
              >
                <TwitterIcon className="h-7" />
              </a>
              <a
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-900"
                href={media.discord}
                target="_blank"
                rel="noreferrer"
              >
                <DiscordIcon className="h-7" />
              </a>
            </div>
          </div>
          <div className="gap- flex items-center"></div>
        </HamburgerDropdown>
        <Dropdown
          className="hidden h-[38px] md:flex"
          tabs={[
            {
              name: "Arbitrum",
              content: (
                <>
                  {" "}
                  <ArbitrumIcom className="w-4" />
                  Arbitrum
                </>
              ),
              onClick: () => switchChain("Arbitrum"),
            },
          ]}
        >
          <ArbitrumIcom className="w-4" />
          Arbitrum
        </Dropdown>
        <Button className="md:ml-0">Connect Wallet</Button>
      </div>
    </div>
  );
};

export default Navigation;