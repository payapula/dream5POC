// Create a shared dashboard cache utility with daily expiration
export const dashboardCache = {
  cache: new Map(),
  lastUpdated: null as number | null,

  // Check if cache is expired (older than 1 day)
  isExpired() {
    if (!this.lastUpdated) return true;
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Date.now() - this.lastUpdated > oneDayMs;
  },

  // Get cached dashboard data
  get() {
    if (this.isExpired()) return null;
    return this.cache.get("dashboard");
  },

  // Set cached dashboard data
  set(data: any) {
    this.cache.set("dashboard", data);
    this.lastUpdated = Date.now();
  },

  // Force invalidate the cache
  invalidate() {
    this.cache.delete("dashboard");
    this.lastUpdated = null;
  },
};
