import { expect } from "@std/expect";
import { DecimalFormat, RoundingMode } from "../lib/index.ts";

// Normal Tests
Deno.test("Basic test usage", () => {
  const df = new DecimalFormat("#,##0.00");

  expect(df.format(234)).toBe("234.00");
  expect(df.format(1234.1)).toBe("1,234.10");
  expect(df.format(1234567.156)).toBe("1,234,567.16");
});

Deno.test("No format, default 3-digit division", () => {
  const df = new DecimalFormat();
  expect(df.format(1234.1)).toBe("1,234.1");
});

Deno.test("Prefix", () => {
  const df = new DecimalFormat("￥#,##0");
  expect(df.format(1234.1)).toBe("￥1,234");
});

Deno.test("Prefix-escape", () => {
  const df = new DecimalFormat("\\##,##0");
  expect(df.format(1234.1)).toBe("#1,234");
});

Deno.test("Prefix - show plus and minus signs", () => {
  const df = new DecimalFormat("+#,##0");
  expect(df.format(1234.1)).toBe("+1,234");
});

Deno.test("Suffix", () => {
  const df = new DecimalFormat("#,##0.00元");
  expect(df.format(1456)).toBe("1,456.00元");
});

Deno.test("Suffix-percentage", () => {
  const df = new DecimalFormat("#,##0.#%");
  expect(df.format(0.1)).toBe("10%");
  expect(df.format(0.1456)).toBe("14.6%");
});

Deno.test("Suffix-thousands", () => {
  const df = new DecimalFormat("#,##0.#‰");
  expect(df.format(0.1)).toBe("100‰");
  expect(df.format(0.1456)).toBe("145.6‰");
});

Deno.test("suffix-escape", () => {
  const df1 = new DecimalFormat("#,##0.#\\‰");
  expect(df1.format(0.1)).toBe("0.1‰");

  const df2 = new DecimalFormat("#,##0.#\\%");
  expect(df2.format(0.1756)).toBe("0.2%");

  const df3 = new DecimalFormat("#,##0\\.00");
  expect(df3.format(1756.69)).toBe("1,757.00");
});

Deno.test("Integer at least 2 digits", () => {
  const df = new DecimalFormat("00");
  expect(df.format(11)).toBe("11");
  expect(df.format(1)).toBe("01");
  expect(df.format(3245)).toBe("3245");
});

Deno.test("If the integer is 0, the integer part will ned.", () => {
  const df = new DecimalFormat("#.00");
  expect(df.format(0.34)).toBe(".34");

  const df1 = new DecimalFormat("#.#");
  expect(df1.format(0.34)).toBe(".3");
  expect(df1.format(0.04)).toBe("0");

  const df2 = new DecimalFormat("#.0");
  expect(df2.format(0.04)).toBe(".0");
});

Deno.test("The decimal part must be at least 2 and at mts", () => {
  const df = new DecimalFormat("#.00##");
  expect(df.format(11)).toBe("11.00");
  expect(df.format(13.12367)).toBe("13.1237");
  expect(df.format(13.19997)).toBe("13.20");
});

Deno.test("Will automatically convert to scientific notation", () => {
  const df = new DecimalFormat("0.00####");
  df.setRoundingMode(RoundingMode.Down);
  expect(df.format(0.0000005)).toBe("0.00");
  df.setRoundingMode(RoundingMode.HalfUp);
  expect(df.format(0.0000005)).toBe("0.000001");
});

Deno.test("RoundingMode.UP", () => {
  const df = new DecimalFormat("0.00##", RoundingMode.Up);
  expect(df.format(13.12361)).toBe("13.1237");
  expect(df.format(-13.12361)).toBe("-13.1237");
});

Deno.test("RoundingMode.DOWN", () => {
  const df = new DecimalFormat("0.00##", RoundingMode.Down);
  expect(df.format(13.13889)).toBe("13.1388");
  expect(df.format(-13.13889)).toBe("-13.1388");
});

Deno.test("RoundingMode.CEILING", () => {
  const df = new DecimalFormat("0.00", RoundingMode.Ceiling);
  expect(df.format(13.1301)).toBe("13.14");
  expect(df.format(-13.1301)).toBe("-13.13");
});

Deno.test("RoundingMode.FLOOR", () => {
  const df = new DecimalFormat("0.00", RoundingMode.Floor);
  expect(df.format(13.137)).toBe("13.13");
  expect(df.format(-13.1301)).toBe("-13.14");
});

Deno.test("RoundingMode.HALF_UP", () => {
  const df = new DecimalFormat("0.0", RoundingMode.HalfUp);
  expect(df.format(13.15)).toBe("13.2");
  expect(df.format(-13.15)).toBe("-13.2");
});

Deno.test("RoundingMode.HALF_DOWN", () => {
  const df = new DecimalFormat("0.0", RoundingMode.HalfDown);
  expect(df.format(13.157)).toBe("13.2");
  expect(df.format(13.15)).toBe("13.1");
  expect(df.format(-13.157)).toBe("-13.2");
  expect(df.format(-13.15)).toBe("-13.1");
});

Deno.test("RoundingMode.HALF_EVEN", () => {
  const df = new DecimalFormat("0.0", RoundingMode.HalfEven);
  expect(df.format(13.25)).toBe("13.2");
  expect(df.format(13.251)).toBe("13.3");
  expect(df.format(-13.25)).toBe("-13.2");
  expect(df.format(-13.251)).toBe("-13.3");

  const df1 = new DecimalFormat("0", RoundingMode.HalfEven);
  expect(df1.format(12.5)).toBe("12");
  expect(df1.format(12.51)).toBe("13");
  expect(df1.format(12.5)).toBe("12");
  expect(df1.format(12.51)).toBe("13");
});

Deno.test("RoundingMode.UNNECESSARY", () => {
  const df = new DecimalFormat("0.0", RoundingMode.Unnecessary);
  expect(df.format.bind(df, 1.45)).toThrow();
  expect(df.format(6.9)).toBe("6.9");
  expect(df.format(6)).toBe("6.0");
});

// Abnormal Tests
Deno.test("multiple decimal points", () => {
  expect(() => new DecimalFormat("0..0")).toThrow(
    /^Multiple decimal separators in pattern/,
  );
});

Deno.test("There is a comma in the decimal part", () => {
  expect(() => new DecimalFormat("0.,0")).toThrow(/^Malformed pattern/);
});

Deno.test("The decimal part appears # in front of 0", () => {
  expect(() => new DecimalFormat("0.#0")).toThrow(
    /^Unexpected '0' in pattern/,
  );
});

Deno.test("The integer part ends with a comma", () => {
  expect(() => new DecimalFormat("0,.0")).toThrow(/^Malformed pattern/);
});

Deno.test("The integer part 0 is in front of #", () => {
  expect(() => new DecimalFormat("0#.0")).toThrow(
    /^Unexpected '0' in pattern/,
  );
});

Deno.test("non-numeric formatting", () => {
  const df = new DecimalFormat("0.0");
  expect(() => {
    df.format("u78");
  }).toThrow("not a valid number");
});
