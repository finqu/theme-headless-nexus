/**
 * Storage backend interface
 * Provides a unified API for different storage implementations
 */
export interface StorageBackend {
  /**
   * Get a value by key
   * @returns The stored value or null if not found
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Set a value by key
   */
  set<T = unknown>(key: string, value: T): Promise<void>;

  /**
   * Delete a value by key
   * @returns true if the key existed and was deleted
   */
  delete(key: string): Promise<boolean>;

  /**
   * Check if a key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * List all keys matching a pattern
   * Pattern supports * as wildcard
   */
  keys(pattern: string): Promise<string[]>;
}
