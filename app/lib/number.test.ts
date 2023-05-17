import { expect, test } from "vitest";

import { floorBigInt } from "./number";

test("floors big integers", () => {
  expect(floorBigInt(BigInt("1000000000000000000"))).toBe(
    BigInt("1000000000000000000")
  );
  expect(floorBigInt(BigInt("1700000000000000000"))).toBe(
    BigInt("1000000000000000000")
  );
});
