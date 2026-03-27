/**
 * API Client for PFMEA Dashboard
 * 
 * Provides functions to fetch procedures and PFMEA data from the backend API
 * with built-in caching to reduce server load.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5
 */

import type { Procedure, PFMEAItem } from '@/types/pfmea';

/**
 * Base URL for the backend API
 * Defaults to localhost:8000 for development
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Custom error type for API errors
 */
export class APIError extends Error {
  status: number;
  endpoint: string;

  constructor(
    message: string,
    status: number,
    endpoint: string
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * API response cache with TTL support
 * Caches responses for 5 minutes to reduce server load
 */
export class APICache {
  private cache: Map<string, CacheEntry<unknown>>;
  private ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store data in cache with current timestamp
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove a specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Global cache instance
 */
const cache = new APICache(5);

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or other errors
    throw new APIError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      0,
      endpoint
    );
  }
}

/**
 * Fetch all procedures from the backend
 * 
 * @returns Promise resolving to array of Procedure objects
 * @throws APIError if the request fails
 * 
 * Requirement 6.1: Call GET /api/procedures to retrieve all Procedure records
 */
export async function fetchProcedures(): Promise<Procedure[]> {
  const cacheKey = 'procedures';

  // Check cache first
  const cached = cache.get<Procedure[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const data = await fetchAPI<Procedure[]>('/api/procedures');

  // Store in cache
  cache.set(cacheKey, data);

  return data;
}

/**
 * Fetch PFMEA items for a specific procedure
 * 
 * @param procedureId - The ID of the procedure to fetch PFMEA items for
 * @returns Promise resolving to array of PFMEAItem objects
 * @throws APIError if the request fails
 * 
 * Requirement 6.2: Call GET /api/procedures/{procedure_id}/pfmea for each Procedure
 */
export async function fetchProcedurePFMEA(procedureId: string): Promise<PFMEAItem[]> {
  const cacheKey = `pfmea:${procedureId}`;

  // Check cache first
  const cached = cache.get<PFMEAItem[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const data = await fetchAPI<PFMEAItem[]>(`/api/procedures/${procedureId}/pfmea`);

  // Store in cache
  cache.set(cacheKey, data);

  return data;
}

/**
 * Clear the API cache
 * Useful for forcing a refresh of data
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Export cache instance for testing purposes
 */
export { cache };
