import { generateKeyBetween } from "fractional-indexing";

/** A key that sorts strictly between `prev` and `next` (either may be null). */
export function positionBetween(prev: string | null, next: string | null) {
    return generateKeyBetween(prev, next);
}

/** Plain string comparison, which is what fractional keys are designed for. */
export function sortByPosition<T extends { position: string }>(items: T[]) {
    return [...items].sort((a, b) =>
        a.position < b.position ? -1 : a.position > b.position ? 1 : 0,
    );
}