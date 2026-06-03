import { describe, it, expect } from "vitest";
import { getDayOfYear } from "../routes/orders";

describe("getDayOfYear Helper Function", () => {
  it("should return 1 for January 1st", () => {
    const date = new Date("2026-01-01T00:00:00+02:00");
    expect(getDayOfYear(date)).toBe(1);
  });

  it("should return correct day of year after Egypt DST transition (GMT+3)", () => {
    // June 4th, 2026, 00:05 Cairo time (GMT+3)
    const date = new Date("2026-06-04T00:05:00+03:00");
    expect(getDayOfYear(date)).toBe(155);
  });

  it("should return 365 for December 31st on non-leap years", () => {
    const date = new Date("2026-12-31T23:59:59+02:00");
    expect(getDayOfYear(date)).toBe(365);
  });

  it("should return 366 for December 31st on leap years", () => {
    const date = new Date("2024-12-31T23:59:59+02:00");
    expect(getDayOfYear(date)).toBe(366);
  });

  it("should handle February 29th correctly on a leap year", () => {
    const date = new Date("2024-02-29T12:00:00+02:00");
    expect(getDayOfYear(date)).toBe(60); // 31 (Jan) + 29 (Feb)
  });

  it("should handle March 1st correctly on a non-leap year", () => {
    const date = new Date("2026-03-01T12:00:00+02:00");
    expect(getDayOfYear(date)).toBe(60); // 31 (Jan) + 28 (Feb) + 1 (Mar)
  });
});
