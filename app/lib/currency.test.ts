import { expect, test } from "vitest";

import { formatAmount, formatTokenAmount } from "./currency";

test("formats amounts", () => {
  expect(formatAmount("123456789.9999")).toBe("123,456,789.99");
  expect(formatAmount("123456.9999")).toBe("123,456.99");
  expect(formatAmount("12345.9999")).toBe("12,345.99");
  expect(formatAmount("1234.9999")).toBe("1,234.99");
  expect(formatAmount("123.9999")).toBe("123.99");
  expect(formatAmount("12.9999")).toBe("12.999");
  expect(formatAmount("1.9999")).toBe("1.999");
  expect(formatAmount("1")).toBe("1");
  expect(formatAmount("0.9999")).toBe("0.9999");
  expect(formatAmount("0.000999")).toBe("0.000999");
  expect(formatAmount("0.00000999")).toBe("0.000009");
});

test("formats token amounts", () => {
  expect(formatTokenAmount(123456789990000000000000000n)).toBe(
    "123,456,789.99"
  );
  expect(formatTokenAmount(123456000000000000000n)).toBe("123.45");
  expect(formatTokenAmount(1000000000000000000n)).toBe("1");
  expect(formatTokenAmount(123456780000000n)).toBe("0.000123");
});
