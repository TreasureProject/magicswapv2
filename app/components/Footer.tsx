import { MagicSwapLogo, MagicSwapLogoFull } from "@treasure-project/branding";
import { Link } from "react-router-dom";
import Balancer from "react-wrap-balancer";

import { DiscordIcon, TwitterIcon } from "~/components/Icons";
import { media } from "~/consts";

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
      href: "https://treasure.lol/about",
      type: "external",
    },
    {
      text: "Team",
      href: "https://treasure.lol/team",
      type: "external",
    },
    {
      text: "Magic",
      href: "https://docs.treasure.lol/getting-started/what-is-magic",
      type: "external",
    },
    {
      text: "Documentation",
      href: "https://docs.treasure.lol/about-treasure/readme",
      type: "external",
    },
    {
      text: "Governance Forum",
      href: "https://gov.treasure.lol/overview",
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
      href: "/privacy",
      type: "internal",
    },
  ],
  Developers: [
    {
      text: "Documentation",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "GitHub",
      href: "treasure.lol",
      type: "external",
    },
    {
      text: "Ecosystem",
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
      href: "/faq",
      type: "internal",
    },
  ],
};

export const Footer = () => {
  return (
    <div className="container bg-night-1200">
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-night-800 to-transparent" />
      <div className="flex items-center justify-between py-6">
        <MagicSwapLogoFull className="h-6 w-auto" />
        {/* <div className="flex items-center gap-1">
          <MagicIcon className="h-4 text-ruby-900" />
          <p className="font-medium">
            $1,724 <span className="text-night-600">USD</span>{" "}
          </p>
        </div> */}
      </div>
      <div className="w-full border-t border-t-night-800">
        <div className="flex flex-col justify-between gap-14 py-12  lg:flex-row lg:items-center lg:gap-0">
          <div className="flex flex-col justify-between gap-6 sm:flex-row lg:flex-col lg:justify-normal">
            <div className="flex items-center gap-6">
              <MagicSwapLogo className="h-6 w-auto sm:h-14" />
              <h1 className="max-w-xs text-lg font-bold text-night-500 sm:text-2xl">
                <Balancer>
                  The gateway to the cross-game{" "}
                  <span className="text-night-100">economy</span>
                </Balancer>
              </h1>
            </div>
            <div className="flex max-w-min items-center divide-x-[1px] divide-night-700 overflow-hidden rounded-lg border border-night-700 text-night-600">
              <a
                className="px-3.5 py-2 transition-colors hover:bg-night-1000 hover:text-night-100"
                href={media.discord}
                target="_blank"
                rel="noreferrer"
              >
                <DiscordIcon className="h-8" />
              </a>

              <a
                className="px-3.5 py-2 transition-colors hover:bg-night-1100 hover:text-night-100"
                href={media.twitter}
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
                <div className="flex flex-col gap-2 text-night-500">
                  {FooterPoints[key]?.map((link: LinkType) => (
                    <a
                      href={link.href}
                      key={link.text}
                      className="transition-colors hover:text-night-400"
                      {...(link.type === "external" && {
                        target: "_blank",
                        rel: "noreferrer",
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
          <p className="base-500 text-center text-sm text-night-500 md:text-start">
            Copyright &copy; {new Date().getFullYear()} MagicSwap. All rights
            reserved.
          </p>
          <div className="flex gap-5 text-night-500">
            <Link to="/tos" className="transition-colors hover:text-night-400">
              Terms of Service
            </Link>
            <Link to="/tos" className="transition-colors hover:text-night-400">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
