import { arbitrum, treasureTopaz } from "viem/chains";
import { describe, expect, it } from "vitest";

import { getBlockExplorerUrl } from "./chain";

describe("chain utils", () => {
  it("should get block explorer url", () => {
    expect(getBlockExplorerUrl({ chainId: treasureTopaz.id })).toBe(
      treasureTopaz.blockExplorers.default,
    );
    expect(getBlockExplorerUrl({ chainId: 0 })).toBe(
      arbitrum.blockExplorers.default,
    );
  });
});
