import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
    it("drops falsy values", () => {
        expect(cn("a", false && "b", "c")).toBe("a c");
    });
    it("lets the later Tailwind class win", () => {
        expect(cn("px-2", "px-4")).toBe("px-4");
    });
});