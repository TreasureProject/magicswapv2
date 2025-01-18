import { describe, expect, it } from "vitest";

import { multiplyArray, sumArray } from "./array";

describe("array utils", () => {
  it("should sum array", () => {
    expect(sumArray([])).toBe(0);
    expect(sumArray([1, 2, 3, 4])).toBe(10);
  });

  it("should multiply array", () => {
    expect(multiplyArray([])).toBe(0);
    expect(multiplyArray([1, 2, 3, 4])).toBe(24);
  });
});
