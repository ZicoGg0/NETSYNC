import {
  calculateDistance,
  calculatePricing,
  getSurgeMultiplier,
  isWithinServiceArea,
  validateCoordinates,
} from "@/lib/pricing";

describe("calculateDistance", () => {
  it("returns 0 for same coordinates", () => {
    const result = calculateDistance(
      { lat: 6.5244, lng: 3.3792 },
      { lat: 6.5244, lng: 3.3792 }
    );
    expect(result).toBe(0);
  });

  it("calculates distance between Ikeja and Lekki", () => {
    const distance = calculateDistance(
      { lat: 6.6018, lng: 3.3515 },
      { lat: 6.4281, lng: 3.4219 }
    );
    expect(distance).toBeGreaterThan(15);
    expect(distance).toBeLessThan(25);
  });
});

describe("getSurgeMultiplier", () => {
  it("returns 1.5x during morning rush (7-9 AM)", () => {
    const morning = new Date("2026-06-18T08:00:00");
    const result = getSurgeMultiplier(morning);
    expect(result.multiplier).toBe(1.5);
  });

  it("returns 1.0x during off-peak hours", () => {
    const offPeak = new Date("2026-06-18T10:00:00");
    const result = getSurgeMultiplier(offPeak);
    expect(result.multiplier).toBe(1.0);
  });

  it("returns 1.4x during evening rush (5-8 PM)", () => {
    const evening = new Date("2026-06-18T18:00:00");
    const result = getSurgeMultiplier(evening);
    expect(result.multiplier).toBe(1.4);
  });
});

describe("isWithinServiceArea", () => {
  it("returns true for Lagos coordinates", () => {
    expect(isWithinServiceArea({ lat: 6.5244, lng: 3.3792 })).toBe(true);
  });

  it("returns false for Abuja coordinates", () => {
    expect(isWithinServiceArea({ lat: 9.0579, lng: 7.4951 })).toBe(false);
  });
});

describe("validateCoordinates", () => {
  it("validates correct coordinates", () => {
    expect(validateCoordinates({ lat: 6.5244, lng: 3.3792 })).toBe(true);
  });

  it("rejects NaN coordinates", () => {
    expect(validateCoordinates({ lat: NaN, lng: 3.3792 })).toBe(false);
  });

  it("rejects out-of-range coordinates", () => {
    expect(validateCoordinates({ lat: 91, lng: 3.3792 })).toBe(false);
    expect(validateCoordinates({ lat: 6.5, lng: 181 })).toBe(false);
  });
});

describe("calculatePricing", () => {
  const pickup = { lat: 6.6018, lng: 3.3515 };
  const dropoff = { lat: 6.4281, lng: 3.4219 };

  it("calculates BIKE pricing correctly", () => {
    const offPeak = new Date("2026-06-18T10:00:00");
    const result = calculatePricing(pickup, dropoff, "BIKE", offPeak);

    expect(result.vehicleType).toBe("BIKE");
    expect(result.basePrice).toBe(2500);
    expect(result.distance).toBeGreaterThan(0);
    expect(result.totalPrice).toBeGreaterThan(2500);
    expect(result.estimatedTime).toBeGreaterThan(0);
    expect(result.surgeMultiplier).toBe(1.0);
    expect(result.surgePrice).toBe(0);
  });

  it("applies surge pricing during peak hours", () => {
    const morning = new Date("2026-06-18T08:00:00");
    const result = calculatePricing(pickup, dropoff, "BIKE", morning);

    expect(result.surgeMultiplier).toBe(1.5);
    expect(result.surgePrice).toBeGreaterThan(0);
  });

  it("HAULAGE costs more than BIKE", () => {
    const offPeak = new Date("2026-06-18T10:00:00");
    const bike = calculatePricing(pickup, dropoff, "BIKE", offPeak);
    const haulage = calculatePricing(pickup, dropoff, "HAULAGE", offPeak);

    expect(haulage.totalPrice).toBeGreaterThan(bike.totalPrice);
  });

  it("throws for invalid vehicle type", () => {
    expect(() =>
      calculatePricing(pickup, dropoff, "HELICOPTER" as "BIKE")
    ).toThrow();
  });
});
