// Create a shared cache utility that can be imported in multiple files
export const matchCache = {
  cache: new Map(),

  // Method to get cached data
  get(matchId: string) {
    const cacheKey = `match-${matchId}`;
    return this.cache.get(cacheKey);
  },

  // Method to set cached data
  set(matchId: string, data: any) {
    const cacheKey = `match-${matchId}`;
    this.cache.set(cacheKey, data);
  },

  // Method to invalidate specific match cache
  invalidate(matchId: string) {
    const cacheKey = `match-${matchId}`;
    this.cache.delete(cacheKey);
  },

  // Method to invalidate all cache
  invalidateAll() {
    this.cache.clear();
  },
};
