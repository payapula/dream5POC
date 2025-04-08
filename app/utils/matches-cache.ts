// Create a shared cache utility for matches list that can be imported in multiple files
export const matchesCache = {
  cache: new Map(),

  // Method to get cached data
  get(key: string) {
    return this.cache.get(key);
  },

  // Method to set cached data
  set(key: string, data: any) {
    this.cache.set(key, data);
  },

  // Method to invalidate all matches cache
  invalidateAll() {
    console.log("invalidating all matches cache");
    this.cache.clear();
  },
};
