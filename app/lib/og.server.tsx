import { Resvg } from "@resvg/resvg-js";
import type { SatoriOptions } from "satori";
import satori from "satori";

import type { Token } from "~/types";

const loadFont = (baseUrl: string, name: string, weight: 500 | 600) =>
  fetch(new URL(`${baseUrl}/fonts/${name}`)).then(
    async (res) =>
      ({
        name: "ABCWhyte",
        weight,
        data: await res.arrayBuffer(),
        style: "normal",
      }) as const,
  );

export const NIGHT_100 = "#E7E8E9";
export const NIGHT_400 = "#9FA3A9";

export const TokenDisplay = ({
  token0,
  token1,
}: {
  token0?: Token | null;
  token1?: Token | null;
}) => (
  <div tw="flex items-center">
    {token0?.image ? (
      <img
        src={token0.image}
        height={132}
        width={132}
        tw={token0.isVault ? "rounded-lg" : "rounded-full"}
        alt="banner"
      />
    ) : null}
    <div
      tw={`${
        token1?.isVault ? "rounded-xl" : "rounded-full"
      } flex items-center justify-center -ml-10 relative`}
      style={{
        ...(token1?.isVault
          ? {
              width: 128,
              height: 128,
            }
          : {
              width: 136,
              height: 136,
            }),
        backgroundColor: "rgba(16, 24, 39, 1)",
      }}
    >
      {token1?.image ? (
        <img
          src={token1.image}
          height={token1.isVault ? 116 : 124}
          width={token1.isVault ? 116 : 124}
          tw={token1.isVault ? "rounded-lg" : "rounded-full"}
          alt="banner"
        />
      ) : null}
    </div>
  </div>
);

export const generateOgImage = async (
  content: React.ReactNode,
  origin: string,
) => {
  const fontData = await Promise.all([
    loadFont(origin, "ABCWhyteVariable.woff", 500),
    loadFont(origin, "ABCWhyte-Bold.otf", 600),
  ]).then((fonts) => fonts.flat());

  const options: SatoriOptions = {
    width: 1200,
    height: 600,
    fonts: fontData,
  };

  const svg = await satori(
    <div
      tw="flex relative"
      style={{
        width: options.width,
        height: options.height,
        fontFamily: "ABCWhyte",
        fontSize: 45,
        backgroundImage: `url(${origin}/img/seo-banner-blank.png)`,
      }}
    >
      {content}
    </div>,
    options,
  );

  const resvg = new Resvg(svg);

  const pngData = resvg.render();

  return pngData.asPng();
};
