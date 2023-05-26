import type { LoaderArgs } from "@remix-run/node";
import { badRequest, image } from "remix-utils";

import { generateOgImage } from "~/lib/og.server";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 600;

export const loader = async ({ request }: LoaderArgs) => {
  const { origin, searchParams } = new URL(request.url);

  const png = await generateOgImage(<div>helloworld</div>, origin);

  return image(png, {
    status: 200,
    type: "image/png",
    headers: {
      "cache-control":
        process.env.NODE_ENV === "development"
          ? "no-cache, no-store"
          : "public, immutable, no-transform, max-age=31536000",
    },
  });
};
