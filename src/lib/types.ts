export type Member = { id: string; name: string; imageUrl: string };

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };