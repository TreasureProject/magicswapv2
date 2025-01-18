import { describe, expect, it } from "vitest";

import { ceilBigInt, floorBigInt, formatNumber, formatPercent } from "./number";

describe("number utils", () => {
  it("should format numbers", () => {
    expect(formatNumber(123456)).toBe("123,456");
    expect(formatNumber("123456")).toBe("123,456");
    expect(formatNumber(123456, { notation: "compact" })).toBe("123K");
  });

  it("should format percents", () => {
    expect(formatPercent(0.123456)).toBe("12.35%");
    expect(formatPercent("0.123456")).toBe("12.35%");
    expect(formatPercent(0.123456, 0)).toBe("12%");
    expect(formatPercent(0.123456, 4)).toBe("12.3456%");
  });

  it("should floor bigints", () => {
    expect(floorBigInt(1000000000000000000n)).toBe(1000000000000000000n);
    expect(floorBigInt(1700000000000000000n)).toBe(1000000000000000000n);
    expect(floorBigInt(1700000n, 6)).toBe(1000000n);
  });

  it("should ceil bigints", () => {
    expect(ceilBigInt(1000000000000000000n)).toBe(1000000000000000000n);
    expect(ceilBigInt(1700000000000000000n)).toBe(2000000000000000000n);
    expect(ceilBigInt(1700000n, 6)).toBe(2000000n);
  });
});
