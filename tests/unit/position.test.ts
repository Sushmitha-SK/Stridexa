import { describe, expect, it } from "vitest";
import { positionBetween, sortByPosition } from "@/lib/position";

describe("fractional positions", () => {
    it("creates a first key and appends after it", () => {
        const a = positionBetween(null, null);
        const b = positionBetween(a, null);
        expect(a < b).toBe(true);
    });

    it("inserts between two neighbours", () => {
        const a = positionBetween(null, null);
        const c = positionBetween(a, null);
        const b = positionBetween(a, c);
        expect(a < b && b < c).toBe(true);
    });

    it("keeps order after many inserts at the same spot", () => {
        const first = positionBetween(null, null);
        let last = positionBetween(first, null);
        const keys = [first];
        for (let i = 0; i < 50; i++) {
            const k = positionBetween(first, last);
            keys.push(k);
            last = k;
        }
        const sorted = sortByPosition(keys.map((position) => ({ position })));
        expect(sorted[0].position).toBe(first);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("sorts by plain string comparison", () => {
        const sorted = sortByPosition([{ position: "a1" }, { position: "Zz" }, { position: "a0" }]);
        expect(sorted.map((s) => s.position)).toEqual(["Zz", "a0", "a1"]);
    });
});