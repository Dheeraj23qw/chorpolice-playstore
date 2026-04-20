import { secondsUntilDate, secondsUntilTomorrowAt } from "./time";

describe("secondsUntilTomorrowAt", () => {
  it("calculates from the provided clock for deterministic tests", () => {
    const now = new Date(2026, 3, 20, 10, 15, 0, 0);

    expect(secondsUntilTomorrowAt(20, now)).toBe(121500);
  });
});

describe("secondsUntilDate", () => {
  it("returns null for past dates", () => {
    const target = new Date("2026-04-20T10:00:00.000Z");

    expect(secondsUntilDate(target, target.getTime() + 1)).toBeNull();
  });

  it("returns the remaining seconds for future dates", () => {
    const target = new Date("2026-04-20T10:00:10.000Z");

    expect(secondsUntilDate(target, target.getTime() - 1_200)).toBe(1);
    expect(secondsUntilDate(target, target.getTime() - 10_000)).toBe(10);
  });
});
