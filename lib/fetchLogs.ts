import type { TruckLog } from "./types";

/**
 * Client-side fetch for truck logs. Used by dashboard and report pages.
 * Ensures consistent fetching with no-store cache and credentials.
 */
export async function fetchLogs(
  page: number = 1,
  limit: number = 50
): Promise<{ logs: TruckLog[]; total: number; page: number; limit: number; totalPages: number }> {
  const res = await fetch(`/api/logs?page=${page}&limit=${limit}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}
