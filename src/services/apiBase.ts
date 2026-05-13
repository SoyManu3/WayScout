const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

function normalizeBaseUrl(value?: string): string {
  if (!value) {
    return "";
  }

  return value.replace(/\/+$/, "");
}

export function buildApiUrl(path: string): string {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
