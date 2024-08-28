import { fetchTokens } from "~/api/tokens.server";
import { getBuiltGraphClient } from ".graphclient";

export const loader = async () => {
  try {
    await fetchTokens();
    return new Response("OK");
  } catch (err) {
    console.error("Healthcheck failed:", err);

    const client = await getBuiltGraphClient();
    console.log(JSON.stringify(client, null, 2));

    return new Response("ERROR", { status: 500 });
  }
};
