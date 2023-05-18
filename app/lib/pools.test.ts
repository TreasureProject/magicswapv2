import { expect, test } from "vitest";

import { getAmountMin, getLpCountForTokens, quote } from "./pools";

test("quotes token in another currency", () => {
  expect(
    quote(
      BigInt("1000000000000000000"),
      BigInt(0),
      BigInt("29250623088211647000000")
    )
  ).toBe(BigInt(0));
  expect(
    quote(
      BigInt("1000000000000000000"),
      BigInt("49000000000000000000"),
      BigInt("29250623088211647000000")
    )
  ).toBe(BigInt("596951491596156061224"));
});

test("generates LP count for tokens", () => {
  expect(
    getLpCountForTokens(
      BigInt("1000000000000000000"),
      BigInt("5000000000000000000"),
      BigInt("100000000000000000000")
    )
  ).toBe(BigInt("20000000000000000000"));
});

test("generates min amount based on slippage", () => {
  expect(getAmountMin(BigInt("1000000000000000000"), 0.005)).toBe(
    BigInt("995000000000000000")
  );
});
