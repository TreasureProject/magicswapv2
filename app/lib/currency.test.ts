import { expect, test } from "vitest";

import { formatBigInt } from "./currency";

test("formats big integers", () => {
  expect(formatBigInt(BigInt("1000000000000000000"))).toBe("1");
  expect(formatBigInt(BigInt("123456000000000000000"))).toBe("123.456");
  expect(formatBigInt(BigInt("123456789000000000000"))).toBe("123.45678");
  expect(formatBigInt(BigInt("123456789000000000000000000"))).toBe(
    "123,456,789"
  );
  expect(formatBigInt(BigInt("123456780000000"))).toBe("0.00012345");
});
