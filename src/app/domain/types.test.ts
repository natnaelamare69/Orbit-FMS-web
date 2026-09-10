import { describe, expect, it } from "vitest";
import { TRIP_TRANSITIONS, TripStatus } from "./types";

describe("trip state machine", () => {
  it("mirrors the backend ADR-0002 legal transitions", () => {
    const legal = {
      [TripStatus.UNASSIGNED]: [TripStatus.ASSIGNED, TripStatus.CANCELLED],
      [TripStatus.ASSIGNED]: [TripStatus.LOADING, TripStatus.CANCELLED],
      [TripStatus.LOADING]: [TripStatus.IN_TRANSIT, TripStatus.CANCELLED],
      [TripStatus.IN_TRANSIT]: [TripStatus.INCIDENT, TripStatus.UNLOADING],
      [TripStatus.INCIDENT]: [TripStatus.IN_TRANSIT, TripStatus.UNLOADING],
      [TripStatus.UNLOADING]: [TripStatus.COMPLETED, TripStatus.INCIDENT],
    };
    for (const [from, to] of Object.entries(legal)) {
      expect(TRIP_TRANSITIONS[from as TripStatus]).toEqual(to);
    }
  });

  it("does not allow completion directly from loading", () => {
    expect(TRIP_TRANSITIONS[TripStatus.LOADING]).not.toContain(TripStatus.COMPLETED);
  });

  it("terminal states permit no further movement", () => {
    expect(TRIP_TRANSITIONS[TripStatus.COMPLETED]).toEqual([]);
    expect(TRIP_TRANSITIONS[TripStatus.CANCELLED]).toEqual([]);
  });
});