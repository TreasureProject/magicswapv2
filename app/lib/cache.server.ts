import type { CacheEntry } from "cachified";
import { lruCacheAdapter } from "cachified";
import { LRUCache } from "lru-cache";

declare global {
  // This preserves the LRU cache during development
  // eslint-disable-next-line
  var __lruCache: LRUCache<string, CacheEntry> | undefined;
}

let lru: LRUCache<string, CacheEntry>;

if (process.env.NODE_ENV === "production") {
  lru = new LRUCache<string, CacheEntry>({ max: 1000 });
} else {
  if (!global.__lruCache) {
    global.__lruCache = new LRUCache<string, CacheEntry>({ max: 1000 });
  }
  lru = global.__lruCache;
}

const cache = lruCacheAdapter(lru);

export { cache };
