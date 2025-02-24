import {
  type Cache,
  type CacheEntry,
  type CachifiedOptions,
  type GetFreshValue,
  cachified,
  totalTtl,
  verboseReporter,
} from "@epic-web/cachified";
import { LRUCache } from "lru-cache";

const lruInstance = new LRUCache<string, CacheEntry>({
  maxSize: 1_024_000,
  sizeCalculation: (value) => new Blob([JSON.stringify(value)]).size,
});

const lru: Cache = {
  set<T>(key: string, value: CacheEntry<T>) {
    const ttl = totalTtl(value?.metadata);
    return lruInstance.set(key, value, {
      ttl: ttl === Number.POSITIVE_INFINITY ? undefined : ttl,
      start: value?.metadata?.createdTime,
    });
  },
  get(key: string) {
    return lruInstance.get(key);
  },
  delete(key: string) {
    return lruInstance.delete(key);
  },
};

export const getCachedValue = async <T>(
  key: string,
  getFreshValue: GetFreshValue<T>,
  options?: Partial<CachifiedOptions<T>>,
) =>
  cachified(
    {
      cache: lru,
      ttl: 86_400_000, // 1 day
      staleWhileRevalidate: 300_000, // 5 minutes
      key,
      getFreshValue,
      ...options,
    },
    verboseReporter(),
  );
