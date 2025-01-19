import { arbitrum, treasureTopaz } from "viem/chains";
import { describe, expect, it } from "vitest";

import { getBlockExplorer } from "./chain";

describe("chain utils", () => {
  it("should get block explorer", () => {
    expect(getBlockExplorer({ chainId: treasureTopaz.id })).toBe(
      treasureTopaz.blockExplorers.default,
    );
    expect(getBlockExplorer({ chainId: 0 })).toBe(
      arbitrum.blockExplorers.default,
    );
  });
});
