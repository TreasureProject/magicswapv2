import type { LoaderArgs } from "@remix-run/node";
import { image } from "remix-utils";
import invariant from "tiny-invariant";

import { fetchPool } from "~/api/pools.server";
import { formatAmount, formatTokenAmount, formatUSD } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import {
  MagicSwapLogoFull,
  NIGHT_100,
  NIGHT_400,
  generateOgImage,
} from "~/lib/og.server";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 600;

const PILL_BG = "rgba(64, 70, 82, 0.6)";

export const loader = async ({ request, params }: LoaderArgs) => {
  const { origin } = new URL(request.url);

  invariant(params.id, "Missing pool id");

  const pool = await fetchPool(params.id);

  const baseToken = pool?.baseToken;
  const quoteToken = pool?.quoteToken;

  const png = await generateOgImage(
    <div tw="flex p-16 w-full">
      <div tw="flex justify-between flex-col">
        <MagicSwapLogoFull />
        <div tw="flex">
          <img
            src={
              baseToken?.isNFT
                ? baseToken?.image
                : `${origin}${baseToken?.image}`
            }
            height={132}
            width={132}
            tw={baseToken?.isNFT ? "rounded-lg" : "rounded-full"}
            alt="banner"
          />
          <div
            tw="rounded-full flex items-center justify-center -ml-10 relative"
            style={{
              width: 136,
              height: 136,
              backgroundColor: "rgba(13, 20, 32, 1)",
            }}
          >
            <img
              src={
                quoteToken?.isNFT
                  ? quoteToken?.image
                  : `${origin}${quoteToken?.image}`
              }
              height={124}
              width={124}
              tw={quoteToken?.isNFT ? "rounded-lg" : "rounded-full"}
              alt="banner"
            />
          </div>
        </div>
        <div tw="flex flex-col">
          <div
            tw="flex font-bold text-5xl"
            style={{
              color: NIGHT_100,
            }}
          >
            <div tw="flex">{baseToken?.symbol}</div>
            <div tw="flex mx-2">/</div>
            <div tw="flex">{quoteToken?.symbol}</div>
          </div>
          <div tw="flex mt-6">
            <div tw="flex flex-col">
              <div
                tw="font-semibold text-3xl"
                style={{
                  color: NIGHT_100,
                }}
              >
                {formatTokenAmount(
                  BigInt(baseToken?.reserveBI || 0),
                  baseToken?.decimals
                )}
              </div>
              <div
                style={{
                  color: NIGHT_400,
                }}
                tw="text-lg"
              >
                {baseToken?.symbol}
              </div>
            </div>
            <div tw="flex ml-12 flex-col">
              <div
                tw="font-semibold text-3xl"
                style={{
                  color: NIGHT_100,
                }}
              >
                {formatTokenAmount(
                  BigInt(quoteToken?.reserveBI || 0),
                  quoteToken?.decimals
                )}
              </div>
              <div
                style={{
                  color: NIGHT_400,
                }}
                tw="text-lg"
              >
                {quoteToken?.symbol}
              </div>
            </div>
            <div tw="flex ml-12 flex-col">
              <div
                tw="font-semibold text-3xl"
                style={{
                  color: NIGHT_100,
                }}
              >
                {formatUSD(pool?.reserveUSD || 0)}
              </div>
              <div
                style={{
                  color: NIGHT_400,
                }}
                tw="text-lg"
              >
                TVL
              </div>
            </div>
            <div tw="flex ml-12 flex-col">
              <div
                tw="font-semibold text-3xl"
                style={{
                  color: NIGHT_100,
                }}
              >
                {formatPercent(pool?.apy || 0)}
              </div>
              <div
                style={{
                  color: NIGHT_400,
                }}
                tw="text-lg"
              >
                APY
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        tw="flex text-3xl absolute right-16 top-16 items-center px-6 pb-5 pt-3 rounded-full font-semibold"
        style={{
          backgroundColor: PILL_BG,
        }}
      >
        <div
          tw="flex items-center"
          style={{
            color: NIGHT_100,
          }}
        >
          <span>1</span>
          <span
            tw="ml-2"
            style={{
              color: NIGHT_400,
            }}
          >
            {baseToken?.symbol}
          </span>
        </div>
        <svg
          width="24"
          height="19"
          viewBox="0 0 24 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          tw="mx-4 mt-2"
        >
          <path
            d="M6.16683 18.8334L0.333496 13L6.16683 7.16669L7.80016 8.82919L4.796 11.8334H13.1668V14.1667H4.796L7.80016 17.1709L6.16683 18.8334ZM17.8335 11.8334L16.2002 10.1709L19.2043 7.16669H10.8335V4.83335H19.2043L16.2002 1.82919L17.8335 0.166687L23.6668 6.00002L17.8335 11.8334Z"
            fill="#888C93"
          />
        </svg>

        <div
          tw="flex items-center"
          style={{
            color: NIGHT_100,
          }}
        >
          <span>
            {formatAmount(
              (quoteToken?.reserve || 0) / (baseToken?.reserve || 0)
            )}
          </span>
          <span
            tw="ml-2"
            style={{
              color: NIGHT_400,
            }}
          >
            {quoteToken?.symbol}
          </span>
        </div>
      </div>
    </div>,

    origin
  );

  return image(png, {
    status: 200,
    type: "image/png",
    headers: {
      "cache-control":
        process.env.NODE_ENV === "development"
          ? "no-cache, no-store"
          : "public, immutable, no-transform, max-age=86400",
    },
  });
};