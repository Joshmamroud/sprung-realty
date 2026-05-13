const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (ID_PATTERN.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const isYouTubeHost =
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com" ||
    host === "youtu.be";
  if (!isYouTubeHost) return null;

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && ID_PATTERN.test(id) ? id : null;
  }

  const v = url.searchParams.get("v");
  if (v && ID_PATTERN.test(v)) return v;

  const segments = url.pathname.split("/").filter(Boolean);
  const candidate =
    segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "v"
      ? segments[1]
      : null;
  return candidate && ID_PATTERN.test(candidate) ? candidate : null;
}

export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
