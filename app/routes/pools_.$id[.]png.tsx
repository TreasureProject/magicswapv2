import type { LoaderFunctionArgs } from "@remix-run/node";
import { MagicSwapLogoFull } from "@treasure-project/branding";
import invariant from "tiny-invariant";

import { fetchPool } from "~/api/pools.server";
import { formatAmount, formatTokenAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, formatPercent } from "~/lib/number";
import {
  NIGHT_100,
  NIGHT_400,
  TokenDisplay,
  generateOgImage,
} from "~/lib/og.server";

const PILL_BG = "rgba(64, 70, 82, 0.6)";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { origin } = new URL(request.url);

  invariant(params.id, "Missing pool id");

  const pool = await fetchPool(params.id);

  const baseToken = pool?.baseToken;
  const quoteToken = pool?.quoteToken;

  const png = await generateOgImage(
    <div tw="flex p-16 w-full">
      <div tw="flex justify-between flex-col">
        <MagicSwapLogoFull tw="w-72 h-14" />
        <TokenDisplay token0={baseToken} token1={quoteToken} origin={origin} />
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
                  BigInt(baseToken?.reserve ?? "0"),
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
                  BigInt(quoteToken?.reserve ?? "0"),
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
              bigIntToNumber(
                BigInt(quoteToken?.reserve ?? "0"),
                quoteToken?.decimals
              ) /
                bigIntToNumber(
                  BigInt(baseToken?.reserve ?? "0"),
                  baseToken?.decimals
                )
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

  return new Response(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "cache-control":
        import.meta.env.NODE_ENV === "development"
          ? "no-cache, no-store"
          : "public, immutable, no-transform, max-age=86400",
    },
  });
};
