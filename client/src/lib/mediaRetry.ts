export function withMediaRetry(url: string, retryCount: number): string {
  if (retryCount <= 0) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}mediaRetry=${retryCount}`;
}
