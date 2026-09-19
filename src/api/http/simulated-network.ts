import { ApiError } from "@/types/api";

/**
 * A tiny "network" simulator so the mock backend behaves like a real one:
 * it adds latency and can be told to fail on demand. This is what lets the
 * UI demonstrate loading / submitting / error states honestly instead of
 * resolving promises instantly.
 */

const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

/** Runtime toggle so QA / delivery demo can show the Error state on purpose. */
const FORCE_ERROR_STORAGE_KEY = "procureflow.debug.forceError";

export function isForceErrorEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(FORCE_ERROR_STORAGE_KEY) === "true";
}

export function setForceErrorEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FORCE_ERROR_STORAGE_KEY, String(enabled));
}

function randomDelay(): number {
  if (import.meta.env?.MODE === "test") return 0;
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

/**
 * Wrap a synchronous "database" operation so it behaves like an async
 * network call: latency first, then either the resolved value or a
 * simulated failure.
 */
export async function simulateNetwork<T>(operation: () => T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, randomDelay()));

  if (isForceErrorEnabled()) {
    throw new ApiError(
      "Simulated network failure. Turn off 'Force error mode' to continue.",
      503,
      "SIMULATED_FAILURE",
    );
  }

  try {
    return operation();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const message = error instanceof Error ? error.message : "Unexpected error";
    throw new ApiError(message, 400, "OPERATION_FAILED");
  }
}
