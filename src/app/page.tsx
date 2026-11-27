import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Landing() {

  const { userId } = await auth();
  if (userId) redirect("/dashboard")

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Move work forward, together.
        </h1>
        <p className="max-w-xl text-lg text-muted">
          STRIDEXA is a calm workspace for planning projects, dragging tasks across a board and
          seeing what changed since yesterday.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/sign-up"
          className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-ink hover:opacity-90"
        >
          Create a workspace
        </Link>
        <Link
          href="/sign-in"
          className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-5 text-sm hover:bg-accent-soft"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
