import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { getParticipant, type ParticipantId } from "@/data/wheelhouse-types";

export const dynamic = "force-dynamic";

/**
 * GET /api/wheelhouse/me
 *
 * Returns the calling participant. Resolves identity from either:
 *   - x-wheelhouse-agent header (set by middleware after Bearer-token auth)
 *   - wheelhouse_who cookie (set by /api/wheelhouse/login for human sessions)
 *
 * Used by wheelhouse.py `whoami` and `orient` subcommands so the CLI knows
 * which participant the token resolves to (without leaking the token map).
 */
export async function GET() {
  const h = await headers();
  const c = await cookies();
  const id =
    (h.get("x-wheelhouse-agent") as ParticipantId | null) ??
    (c.get("wheelhouse_who")?.value as ParticipantId | undefined) ??
    null;
  if (!id) {
    return NextResponse.json({ error: "no identity" }, { status: 401 });
  }
  try {
    const p = getParticipant(id);
    return NextResponse.json({
      id: p.id,
      name: p.name,
      kind: p.kind,
      ownerId: p.ownerId ?? null,
      accent: p.accent,
    });
  } catch {
    return NextResponse.json(
      { error: `unknown participant: ${id}` },
      { status: 400 },
    );
  }
}
