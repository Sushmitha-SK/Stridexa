import { describe, expect, it } from "vitest";
import { PRIORITIES, PRIORITY_RANK, STATUSES, STATUS_LABEL } from "@/lib/constants";

describe("constants", () => {
    it("has a label for every status", () => {
        for (const s of STATUSES) expect(STATUS_LABEL[s]).toBeTruthy();
    });

    it("ranks priorities strictly upward in PRIORITIES order", () => {
        const ranks = PRIORITIES.map((p) => PRIORITY_RANK[p]);
        expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
        expect(new Set(ranks).size).toBe(ranks.length);
    });
});