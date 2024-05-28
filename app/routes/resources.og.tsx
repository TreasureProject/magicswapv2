import type { LoaderFunctionArgs } from "@remix-run/node";

import { generateOgImage } from "~/lib/og.server";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 600;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { origin } = new URL(request.url);

  const png = await generateOgImage(<div>helloworld</div>, origin);

  return new Response(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "cache-control":
        process.env.NODE_ENV === "development"
          ? "no-cache, no-store"
          : "public, immutable, no-transform, max-age=31536000",
    },
  });
};
