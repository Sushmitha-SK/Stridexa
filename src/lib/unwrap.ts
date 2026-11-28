import type { ActionResult } from "./types";

export async function unwrap<T>(p: Promise<ActionResult<T>>): Promise<T> {
    const res = await p;
    if (!res.ok) throw new Error(res.error);
    return res.data;
}