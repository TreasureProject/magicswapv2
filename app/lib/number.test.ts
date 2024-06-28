import { expect, test } from "vitest";

import { floorBigInt } from "./number";

test("floors big integers", () => {
  expect(floorBigInt(1000000000000000000n)).toBe(1000000000000000000n);
  expect(floorBigInt(1700000000000000000n)).toBe(1000000000000000000n);
});
