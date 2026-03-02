import type { TruckLog } from "./types";

/**
 * Fetches unique codes for truck logs by matching with truck_sessions.
 * Returns a Map of logId -> uniqueCode.
 */
export async function fetchUniqueCodesForLogs(
  logs: TruckLog[]
): Promise<Map<string, string>> {
  const codesMap = new Map<string, string>();

  await Promise.all(
    logs.map(async (log) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const sessionsResponse = await fetch(
          `/api/truck-sessions?direction=${log.direction}&plateNumber=${encodeURIComponent(log.plate)}&limit=100`,
          {
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
          }
        );

        clearTimeout(timeoutId);

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          if (sessionsData.sessions?.length > 0) {
            const logDate = new Date(log.createdAt);
            const sortedSessions = sessionsData.sessions
              .map((s: { createdAt: string }) => ({
                ...s,
                timeDiff: Math.abs(
                  new Date(s.createdAt).getTime() - logDate.getTime()
                ),
              }))
              .sort(
                (a: { timeDiff: number }, b: { timeDiff: number }) =>
                  a.timeDiff - b.timeDiff
              );
            const session =
              sortedSessions.find(
                (s: { timeDiff: number }) => s.timeDiff < 24 * 60 * 60 * 1000
              ) || sortedSessions[0];
            if (session?.uniqueCode) {
              codesMap.set(log.id, session.uniqueCode);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") return;
          if (error.message.includes("Failed to fetch")) return;
        }
      }
    })
  );

  return codesMap;
}
