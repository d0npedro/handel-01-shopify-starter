export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength);
}

export function cleanSingleLine(value: unknown, maxLength: number) {
  return cleanText(value, maxLength).replace(/\s+/g, " ");
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function isJsonRequest(request: Request, maxBytes = 32_768) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return false;
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return true;
  const bytes = Number(contentLength);
  return Number.isFinite(bytes) && bytes >= 0 && bytes <= maxBytes;
}
