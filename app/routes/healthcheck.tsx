import { fetchTokens } from "~/api/tokens.server";
import { getMeshOptions } from ".graphclient";

export const loader = async () => {
  try {
    await fetchTokens();
    return new Response("OK");
  } catch (err) {
    const options = await getMeshOptions();
    console.error("Healthcheck failed:", err, options);
    return new Response("ERROR", { status: 500 });
  }
};
