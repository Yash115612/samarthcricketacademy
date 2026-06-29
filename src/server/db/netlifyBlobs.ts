/**
 * Netlify Blobs persistence layer for the in-memory database.
 *
 * On Netlify serverless, the filesystem is read-only and writes are lost between
 * Lambda cold starts. This module persists the full DB snapshot to Netlify Blobs
 * so data survives cold starts.
 *
 * On local dev, all functions are no-ops.
 */

const STORE_NAME = "cricket-academy-db";
const BLOB_KEY = "db-snapshot";

const isNetlify = !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);

/** Save the full DB object to Netlify Blobs (fire-and-forget, never throws). */
export function saveToBlobsAsync(db: object): void {
  if (!isNetlify) return;
  (async () => {
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore(STORE_NAME);
      await store.setJSON(BLOB_KEY, db);
    } catch (err) {
      console.warn("[Blobs] Save failed:", (err as Error).message);
    }
  })();
}

/** Load the DB snapshot from Netlify Blobs. Returns null if not found or on error. */
export async function loadFromBlobs(): Promise<object | null> {
  if (!isNetlify) return null;
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore(STORE_NAME);
    const data = await store.get(BLOB_KEY, { type: "json" });
    return data as object | null;
  } catch (err) {
    console.warn("[Blobs] Load failed:", (err as Error).message);
    return null;
  }
}

/** One-shot promise that loads from Blobs and patches the db object in place. */
let _syncPromise: Promise<void> | null = null;

export function syncDbFromBlobs(db: Record<string, unknown>, onLoaded?: () => void): Promise<void> {
  if (_syncPromise) return _syncPromise;
  _syncPromise = (async () => {
    const snapshot = await loadFromBlobs();
    if (snapshot && typeof snapshot === "object") {
      Object.assign(db, snapshot);
      onLoaded?.();
    }
  })();
  return _syncPromise;
}

/** Reset the sync lock (used in tests). */
export function resetBlobSyncState(): void {
  _syncPromise = null;
}
