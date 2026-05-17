import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function start(v: string | null | undefined, n: number): string {
  if (!v) return "(empty)";
  return `${v.slice(0, n)}... (len=${v.length})`;
}

export async function GET() {
  const url = process.env.DATABASE_URL ?? process.env.DATABASE_URI;
  if (!url) return NextResponse.json({ error: "no DATABASE_URL" });

  const pool = new Pool({ connectionString: url, max: 1 });

  try {
    const { rows } = await pool.query<{
      id: string;
      client_id: string | null;
      refresh_token: string | null;
      access_token: string | null;
      expiry_time: string | null;
      updated_at: string;
    }>(
      "SELECT id, client_id, refresh_token, access_token, expiry_time, updated_at FROM zoho_tokens ORDER BY id",
    );

    return NextResponse.json({
      count: rows.length,
      envRefreshPrefix: start(process.env.ZOHO_REFRESH_TOKEN, 12),
      rows: rows.map((r) => ({
        id: r.id,
        client_id: start(r.client_id, 16),
        refresh_token: start(r.refresh_token, 12),
        refresh_matches_env: r.refresh_token === process.env.ZOHO_REFRESH_TOKEN,
        access_token: start(r.access_token, 12),
        expiry_time: r.expiry_time,
        expiry_iso: r.expiry_time ? new Date(Number(r.expiry_time)).toISOString() : null,
        updated_at: r.updated_at,
      })),
    });
  } finally {
    await pool.end();
  }
}

export async function DELETE() {
  const url = process.env.DATABASE_URL ?? process.env.DATABASE_URI;
  if (!url) return NextResponse.json({ error: "no DATABASE_URL" });
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    const r = await pool.query("DELETE FROM zoho_tokens");
    return NextResponse.json({ deleted: r.rowCount });
  } finally {
    await pool.end();
  }
}
