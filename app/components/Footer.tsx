import React from "react";
import { MagicSwapLogoFull, MagicSwapLogo } from "~/assets/Svgs";
import { DiscordIcon, TwitterIcon, MagicIcon } from "~/assets/Icons";
import { Container } from "../layout/Container";
import { Link } from "react-router-dom";

interface LinkType {
  text: string;
  href: string;
  type: "external" | "internal";
}

const FooterPoints: {
  [key: string]: LinkType[];
} = {
  Treasure: [
    {
      text: "About Treasure",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "Team",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "Magic",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "Documentation",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "Governance Forum",
      href: "treasure.lol",
      type: "external",
    },
  ],
  Legal: [
    {
      text: "Terms of Service",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "Privacy Policy",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "Magic",
      href: "treasure.lol",
      type: "external",
    },
  ],
  Developers: [
    {
      text: "Documentation",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "Github",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "Eco System",
      href: "treasure.lol",
      type: "external",
    },
  ],
  Assistance: [
    {
      text: "Support",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "FAQ",
      href: "treasure.lol",
      type: "external",
    },
  ],
};

export const Footer = () => {
  return (
    <div className="w-full bg-base-1200">
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-base-800 to-transparent" />
      <Container className="flex items-center justify-between py-6">
        <MagicSwapLogoFull className="h-6" />
        <div className="flex items-center gap-1">
          <MagicIcon className="h-4 text-treasure-red-900" />
          <p className="font-medium">
            $1,724 <span className="text-base-600">USD</span>{" "}
          </p>
        </div>
      </Container>
      <div className="w-full border-t border-t-base-800">
        <Container className="flex flex-col justify-between gap-14 py-12  lg:flex-row lg:items-center lg:gap-0">
          <div className="flex flex-col justify-between gap-6 sm:flex-row lg:flex-col lg:justify-normal">
            <div className="flex items-center gap-6">
              <MagicSwapLogo className="h-14" />
              <h1 className="max-w-[274px] text-2xl font-bold text-base-500">
                The Gateway to the cross-game{" "}
                <span className="text-base-100">economy</span>
              </h1>
            </div>
            <div className="flex max-w-min items-center divide-x-[1px] divide-base-700 overflow-hidden rounded-lg border border-base-700 text-base-600">
              <a
                className="px-3.5 py-2 transition-colors hover:bg-base-1000 hover:text-base-100"
                href="https://twitter.com/MagicSwap_"
                target="_blank"
                rel="noreferrer"
              >
                <DiscordIcon className="h-8" />
              </a>

              <a
                className="px-3.5 py-2 transition-colors hover:bg-base-1100 hover:text-base-100"
                href="https://twitter.com/MagicSwap_"
                target="_blank"
                rel="noreferrer"
              >
                <TwitterIcon className="h-8" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 gap-y-8 md:grid-cols-4">
            {Object.keys(FooterPoints).map((key: string) => (
              <div className="flex flex-col gap-3" key={key}>
                <p className="text-sm font-medium">{key}</p>
                <div className="flex flex-col gap-2 text-base-500">
                  {FooterPoints[key].map((link: LinkType) => {
                    if (link.type === "external") {
                      return (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          key={link.text}
                          className="transition-colors hover:text-base-400"
                        >
                          {link.text}
                        </a>
                      );
                    } else {
                      return (
                        <Link
                          to={link.href}
                          key={link.text}
                          className="transition-colors hover:text-base-400"
                        >
                          {link.text}
                        </Link>
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
      <div className="w-full border-t border-t-base-800">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="base-500 text-center text-sm text-base-500 md:text-start">
            Copyright © 2022 Magic Swap. All rights reserved.
          </p>
          <div className="flex gap-5 text-base-500">
            <Link to="/tos" className="transition-colors hover:text-base-400">
              Terms of Service
            </Link>
            <Link to="/tos" className="transition-colors hover:text-base-400">
              Privacy Policy
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
};
