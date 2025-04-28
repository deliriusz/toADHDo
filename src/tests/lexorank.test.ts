import { describe, it, expect } from "vitest";
import { stringToLexoRank, lexoRankToString, calculateLexoRank } from "@/lib/lexorank-utils";

describe("lexorank-utils", () => {
  it("parses and serialises round‐trip", () => {
    const sr = stringToLexoRank("0|abc:1");
    expect(sr).toEqual({ bucket: 0, rank: "abc", marker: 1 });
    expect(lexoRankToString(sr)).toBe("0|abc:1");
  });

  it("handles empty rank", () => {
    const sr = stringToLexoRank("0|:0");
    expect(sr).toEqual({ bucket: 0, rank: "", marker: 0 });
    expect(lexoRankToString(sr)).toBe("0|:0");
  });

  it("gets simple midpoint between a and c", () => {
    const mid = calculateLexoRank("0|a:0", "0|c:0");
    expect(lexoRankToString(mid)).toBe("0|b:0");
    expect(mid.bucket).toBe(0);
    expect(mid.marker).toBe(0);
  });

  it("extends deep when prefix equal", () => {
    const mid = calculateLexoRank("0|aa:0", "0|ab:0");
    expect(lexoRankToString(mid)).toBe("0|aaU:0");
  });

  it("returns prev when inputs inverted", () => {
    const prev = "0|c:0";
    const out = calculateLexoRank(prev, "0|a:0");
    expect(lexoRankToString(out)).toBe(prev);
  });

  it("handles long shared prefix", () => {
    const mid = calculateLexoRank("0|aaaaa:0", "0|aaaae:0");
    expect(lexoRankToString(mid)).toBe("0|aaaac:0");
  });

  it("preserves bucket and marker from prev", () => {
    const mid = calculateLexoRank("2|m:1", "1|p:0");
    expect(mid.bucket).toBe(2);
    expect(mid.marker).toBe(1);
    expect(lexoRankToString(mid)).toBe("2|n:1");
  });
});
