import * as C from "cachified";
import { lruCacheAdapter } from "cachified";
import { LRUCache } from "lru-cache";

declare global {
  // This preserves the LRU cache during development
  // eslint-disable-next-line
  var __lruCache: LRUCache<string, C.CacheEntry> | undefined;
}

let lru: LRUCache<string, C.CacheEntry>;

if (process.env.NODE_ENV === "production") {
  lru = new LRUCache<string, C.CacheEntry>({ max: 1000 });
} else {
  if (!global.__lruCache) {
    global.__lruCache = new LRUCache<string, C.CacheEntry>({ max: 1000 });
  }
  lru = global.__lruCache;
}

const cache = lruCacheAdapter(lru);

async function shouldForceFresh({
  forceFresh,
  request,
  key,
}: {
  forceFresh?: boolean | string;
  request?: Request;
  key: string;
}) {
  if (typeof forceFresh === "boolean") return forceFresh;
  if (typeof forceFresh === "string")
    return forceFresh.split(",").includes(key);

  if (!request) return false;
  const fresh = new URL(request.url).searchParams.get("fresh");
  if (typeof fresh !== "string") return false;
  if (fresh === "") return true;

  return fresh.split(",").includes(key);
}

export async function cachified<Value>({
  request,
  ...options
}: Omit<C.CachifiedOptions<Value>, "forceFresh" | "cache"> & {
  request?: Request;
  forceFresh?: boolean | string;
  cache?: LRUCache<string, C.CacheEntry>;
}): Promise<Value> {
  const cachifiedPromise = C.cachified({
    ...options,
    reporter: C.verboseReporter(),
    cache,
    ttl: 1000 * 60, // 1 minute
    staleWhileRevalidate: 1000 * 60 * 60 * 24, // 1 day
    forceFresh: await shouldForceFresh({
      forceFresh: options.forceFresh,
      request,
      key: options.key,
    }),
  });

  return cachifiedPromise;
}

export { cache };
