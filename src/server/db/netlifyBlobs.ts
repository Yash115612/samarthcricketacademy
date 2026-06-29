// This file is now a no-op since we moved to Supabase/Vercel!

export function saveToBlobsAsync(db: object): void {
  // Do nothing!
}

export async function loadFromBlobs(): Promise<object | null> {
  return null;
}

export function syncDbFromBlobs(db: Record<string, unknown>, onLoaded?: () => void): Promise<void> {
  return Promise.resolve();
}

export function resetBlobSyncState(): void {
  // Do nothing!
}
