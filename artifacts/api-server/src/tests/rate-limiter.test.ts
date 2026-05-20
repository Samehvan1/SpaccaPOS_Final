import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RateLimiter } from "../routes/auth";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests under the limit", () => {
    const limiter = new RateLimiter(1000, 3); // 3 requests per second
    const key = "test-client";

    expect(limiter.isLimitExceeded(key)).toBe(false);
    expect(limiter.isLimitExceeded(key)).toBe(false);
    expect(limiter.isLimitExceeded(key)).toBe(false);
  });

  it("should block requests exceeding the limit", () => {
    const limiter = new RateLimiter(1000, 2); // 2 requests per second
    const key = "test-client";

    expect(limiter.isLimitExceeded(key)).toBe(false);
    expect(limiter.isLimitExceeded(key)).toBe(false);
    expect(limiter.isLimitExceeded(key)).toBe(true); // Exceeded
  });

  it("should isolate limits per key", () => {
    const limiter = new RateLimiter(1000, 1); // 1 request per second
    const key1 = "client-1";
    const key2 = "client-2";

    expect(limiter.isLimitExceeded(key1)).toBe(false);
    expect(limiter.isLimitExceeded(key2)).toBe(false); // Different key is not rate-limited

    expect(limiter.isLimitExceeded(key1)).toBe(true);  // client-1 is rate-limited
    expect(limiter.isLimitExceeded(key2)).toBe(true);  // client-2 is now rate-limited
  });

  it("should reset the rate limit window after the specified time", () => {
    const limiter = new RateLimiter(1000, 2); // 2 requests per second
    const key = "test-client";

    expect(limiter.isLimitExceeded(key)).toBe(false);
    expect(limiter.isLimitExceeded(key)).toBe(false);
    expect(limiter.isLimitExceeded(key)).toBe(true);  // Rate-limited

    // Advance time by 1001 ms (beyond the 1s window)
    vi.advanceTimersByTime(1001);

    expect(limiter.isLimitExceeded(key)).toBe(false); // Limit reset, request allowed
  });
});
