import { NextRequest, NextResponse } from "next/server";
import { updateTag, revalidatePath } from "next/cache";
import { ZOHO_LISTINGS_TAG } from "@/lib/zoho/deals";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const expected = process.env.ZOHO_REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "revalidate disabled" }, { status: 503 });
  }

  const provided = req.headers.get("x-zoho-secret");
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let dealId: string | undefined;
  try {
    const body = (await req.json()) as { dealId?: string } | null;
    dealId = body?.dealId;
  } catch {
    /* no body is fine */
  }

  updateTag(ZOHO_LISTINGS_TAG);
  revalidatePath("/properties");
  revalidatePath("/");

  if (dealId) {
    updateTag(`zoho:listing-photos:${dealId}`);
  }

  return NextResponse.json({ revalidated: true, dealId: dealId ?? null });
}
