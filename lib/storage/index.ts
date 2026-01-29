import type { StorageBackend } from './types';
import { FileStorage } from './file';
import { RedisStorage } from './redis';

export type { StorageBackend } from './types';
export { FileStorage } from './file';
export { RedisStorage } from './redis';

/**
 * Determine which storage backend to use based on environment
 *
 * - If KV_REST_API_URL is set, use Redis (production)
 * - Otherwise, use file-based storage (local development)
 */
function createStorage(): StorageBackend {
  const useRedis = Boolean(process.env.KV_REST_API_URL);

  if (useRedis) {
    return new RedisStorage();
  }

  return new FileStorage();
}

/**
 * Storage singleton instance
 * Automatically selects the appropriate backend based on environment
 */
let storageInstance: StorageBackend | null = null;

export function getStorage(): StorageBackend {
  if (!storageInstance) {
    storageInstance = createStorage();
  }
  return storageInstance;
}

/**
 * Reset storage instance (useful for testing)
 */
export function resetStorage(): void {
  storageInstance = null;
}
