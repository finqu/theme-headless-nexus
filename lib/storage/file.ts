import { promises as fs } from 'fs';
import path from 'path';
import type { StorageBackend } from './types';

/**
 * File-based storage backend for local development
 * Stores data as JSON files in the data/ directory
 */
export class FileStorage implements StorageBackend {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), 'data');
  }

  /**
   * Convert a storage key to a file path
   * e.g., "page:home:draft" -> "data/page/home/draft.json"
   */
  private keyToPath(key: string): string {
    const parts = key.split(':');
    const fileName = parts.pop() + '.json';
    return path.join(this.baseDir, ...parts, fileName);
  }

  /**
   * Ensure the directory for a file exists
   */
  private async ensureDir(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const filePath = this.keyToPath(key);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    const filePath = this.keyToPath(key);
    await this.ensureDir(filePath);
    await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
  }

  async delete(key: string): Promise<boolean> {
    const filePath = this.keyToPath(key);

    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.keyToPath(key);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    const results: string[] = [];

    // Convert pattern to regex
    // e.g., "template:product:*" -> /^template:product:.*$/
    const regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);

    // Recursively scan the base directory
    await this.scanDirectory(this.baseDir, '', results, regex);

    return results;
  }

  /**
   * Recursively scan directory for JSON files and convert paths back to keys
   */
  private async scanDirectory(
    dir: string,
    prefix: string,
    results: string[],
    pattern: RegExp
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        const keyPart = prefix ? `${prefix}:${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          await this.scanDirectory(entryPath, keyPart, results, pattern);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          // Remove .json extension and add to results if matches pattern
          const key = keyPart.replace(/\.json$/, '');
          if (pattern.test(key)) {
            results.push(key);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist - that's fine, just no results
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
