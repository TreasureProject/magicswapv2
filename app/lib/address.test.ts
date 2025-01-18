import { zeroAddress } from "viem";
import { describe, expect, it } from "vitest";

import { truncateEthAddress } from "./address";

describe("address utils", () => {
  it("should truncate eth address", () => {
    expect(truncateEthAddress(zeroAddress)).toBe("0x0000…0000");
    expect(truncateEthAddress("unknown")).toBe("unknown");
  });
});
