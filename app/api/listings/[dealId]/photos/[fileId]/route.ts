import { NextRequest, NextResponse } from "next/server";
import { zohoFetchStream } from "@/lib/zoho/rest";

export const runtime = "nodejs";

const dealIdPattern = /^\d+$/;
const fileIdPattern = /^[a-z0-9]+$/i;

function inferMime(fileName: string | null, headerType: string | null): string {
  if (headerType && headerType !== "application/octet-stream") return headerType;
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    default:
      return "image/jpeg";
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dealId: string; fileId: string }> },
) {
  const { dealId, fileId } = await params;
  if (!dealIdPattern.test(dealId) || !fileIdPattern.test(fileId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  try {
    const upstream = await zohoFetchStream(`/crm/v8/files?id=${fileId}`);
    if (upstream.status >= 400 || !upstream.body) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const disposition = upstream.headers.get("content-disposition") ?? "";
    const fileNameMatch = disposition.match(/filename="?([^";]+)"?/i);
    const contentType = inferMime(
      fileNameMatch?.[1] ?? null,
      upstream.headers.get("content-type"),
    );

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
