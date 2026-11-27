import { describe, expect, it } from "vitest";
import { createProjectSchema } from "@/features/projects/schema";

describe("createProjectSchema", () => {
    it("trims, uppercases the key and accepts a valid project", () => {
        const r = createProjectSchema.parse({ name: "  Website redesign ", key: " web " });
        expect(r.name).toBe("Website redesign");
        expect(r.key).toBe("WEB");
    });
    it("rejects keys that are too short, too long or not letters", () => {
        for (const key of ["W", "WEBSIT", "W3B", "WE-B", ""]) {
            expect(createProjectSchema.safeParse({ name: "Site", key }).success).toBe(false);
        }
    });
    it("rejects a one-character name", () => {
        expect(createProjectSchema.safeParse({ name: "A", key: "WEB" }).success).toBe(false);
    });
    it("allows an optional description up to 500 characters", () => {
        expect(
            createProjectSchema.safeParse({ name: "Site", key: "WEB", description: "x".repeat(501) })
                .success,
        ).toBe(false);
    });
});