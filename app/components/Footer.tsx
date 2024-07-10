import { Link } from "@remix-run/react";
import { MagicSwapLogo } from "@treasure-project/branding";
import { Balancer } from "react-wrap-balancer";

import { DiscordIcon, TwitterIcon } from "~/components/Icons";
import {
  DISCORD_URL,
  DOCS_URL,
  GOVERNANCE_FORUM_URL,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
  TWITTER_URL,
} from "~/consts";

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
      href: "https://docs.treasure.lol/introduction",
      type: "external",
    },
    {
      text: "Team",
      href: "https://treasure.lol/team",
      type: "external",
    },
    {
      text: "MAGIC",
      href: "https://docs.treasure.lol/magic/introduction",
      type: "external",
    },
    {
      text: "Governance Forum",
      href: GOVERNANCE_FORUM_URL,
      type: "external",
    },
  ],
  Legal: [
    {
      text: "Terms of Service",
      href: "https://app.treasure.lol/terms-of-service",
      type: "external",
    },
    {
      text: "Privacy Policy",
      href: "https://app.treasure.lol/privacy-policy",
      type: "external",
    },
  ],
  Developers: [
    {
      text: "Documentation",
      href: DOCS_URL,
      type: "external",
    },
    {
      text: "GitHub",
      href: "https://github.com/TreasureProject",
      type: "external",
    },
  ],
  Support: [
    {
      text: "FAQ",
      href: "https://docs.treasure.lol",
      type: "external",
    },
  ],
};

export const Footer = () => {
  return (
    <div className="container bg-night-1200">
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-night-800 to-transparent" />
      <div className="w-full border-t border-t-night-800">
        <div className="flex flex-col justify-between gap-14 py-12 lg:flex-row lg:items-center lg:gap-0">
          <div className="flex flex-col justify-between gap-6 sm:flex-row lg:flex-col lg:justify-normal">
            <div className="flex items-center gap-6">
              <MagicSwapLogo className="h-6 w-auto sm:h-14" />
              <h1 className="max-w-xs font-bold text-lg text-night-500 sm:text-2xl">
                <Balancer>
                  The gateway to the cross-game{" "}
                  <span className="text-night-100">economy</span>
                </Balancer>
              </h1>
            </div>
            <div className="flex max-w-min items-center divide-x-[1px] divide-night-700 overflow-hidden rounded-lg border border-night-700 text-night-600">
              <a
                className="px-3.5 py-2 transition-colors hover:bg-night-1000 hover:text-night-100"
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
              >
                <DiscordIcon className="h-8" />
              </a>

              <a
                className="px-3.5 py-2 transition-colors hover:bg-night-1100 hover:text-night-100"
                href={TWITTER_URL}
                target="_blank"
                rel="noreferrer"
              >
                <TwitterIcon className="h-5" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 gap-y-8 md:grid-cols-4">
            {Object.keys(FooterPoints).map((key: string) => (
              <div className="flex flex-col gap-3" key={key}>
                <p className="font-medium text-sm">{key}</p>
                <div className="flex flex-col gap-2 text-night-500">
                  {FooterPoints[key]?.map((link: LinkType) => (
                    <a
                      href={link.href}
                      key={link.text}
                      className="transition-colors hover:text-night-400"
                      {...(link.type === "external" && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                    >
                      {link.text}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full border-t border-t-night-800">
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="base-500 text-center text-night-500 text-sm md:text-start">
            Copyright &copy; {new Date().getFullYear()} Magicswap. All rights
            reserved.
          </p>
          <div className="flex gap-5 text-night-500">
            <Link
              to={TERMS_OF_SERVICE_URL}
              className="transition-colors hover:text-night-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </Link>
            <Link
              to={PRIVACY_POLICY_URL}
              className="transition-colors hover:text-night-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
