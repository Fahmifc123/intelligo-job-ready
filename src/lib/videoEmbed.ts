/** Ubah link video (YouTube, Vimeo, atau URL embed) jadi URL iframe. Null bila tidak dikenali. */
export function toEmbedUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube-nocookie.com/embed/${v}?rel=0`;
    const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/);
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`;
    return null;
  }
  if (host === "vimeo.com") {
    const m = u.pathname.match(/^\/(\d+)(?:\/(\w+))?/);
    if (m) return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ""}`;
    return null;
  }
  if (host === "player.vimeo.com" || /(^|\.)mediadelivery\.net$/.test(host) || u.pathname.includes("/embed")) {
    return url;
  }
  return null;
}
