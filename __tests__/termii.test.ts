import { isValidNigerianPhone, normalizePhone } from "@/lib/termii";

describe("isValidNigerianPhone", () => {
  it("accepts +234 format", () => {
    expect(isValidNigerianPhone("+2348012345678")).toBe(true);
    expect(isValidNigerianPhone("+2347012345678")).toBe(true);
    expect(isValidNigerianPhone("+2349012345678")).toBe(true);
  });

  it("accepts 0 prefix format", () => {
    expect(isValidNigerianPhone("08012345678")).toBe(true);
    expect(isValidNigerianPhone("07012345678")).toBe(true);
    expect(isValidNigerianPhone("09012345678")).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(isValidNigerianPhone("1234")).toBe(false);
    expect(isValidNigerianPhone("abc@def.com")).toBe(false);
    expect(isValidNigerianPhone("+1234567890")).toBe(false);
    expect(isValidNigerianPhone("")).toBe(false);
  });

  it("rejects numbers that don't start with 7, 8, or 9", () => {
    expect(isValidNigerianPhone("02012345678")).toBe(false);
    expect(isValidNigerianPhone("+2340012345678")).toBe(false);
  });
});

describe("normalizePhone", () => {
  it("converts 0 prefix to +234", () => {
    expect(normalizePhone("08012345678")).toBe("+2348012345678");
  });

  it("adds + to 234 prefix", () => {
    expect(normalizePhone("2348012345678")).toBe("+2348012345678");
  });

  it("keeps +234 prefix as-is", () => {
    expect(normalizePhone("+2348012345678")).toBe("+2348012345678");
  });
});
