## SpecStory

## Implementing Client Caching for Dashboard (08/04/2025, 20:39:06)

_**User**_

Similar to @match-cache.client.ts  and its logic in @match.ts .

We need to implement clientCaching for @dashboard.tsx  as well. This needs to be a new cache file and it needs to be revalidated only once every day. We can think about bursting/invalidating the cache later with a refresh button next to the table. 

Let's go ahead and implement this logic. 

---

_**Assistant**_

I'll create a dashboard cache utility and implement it in the dashboard route:

```typescript:app/utils/dashboard-cache.client.ts
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
    return this.cache.get('dashboard');
  },

  // Set cached dashboard data
  set(data: any) {
    this.cache.set('dashboard', data);
    this.lastUpdated = Date.now();
  },

  // Force invalidate the cache
  invalidate() {
    this.cache.delete('dashboard');
    this.lastUpdated = null;
  }
};
```

Now let's update the dashboard.tsx to use this cache:

```typescript:app/routes/dashboard.tsx
// ... existing code ...
import { useState, useEffect } from "react";
import { matchCache } from "~/utils/match-cache.client";
import { matchesCache } from "~/utils/matches-cache.client";
import { dashboardCache } from "~/utils/dashboard-cache.client";
import { useLoaderData } from "@remix-run/react";

// ... existing code ...

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  // Check if we have cached data
  const cachedData = dashboardCache.get();
  if (cachedData) {
    return cachedData;
  }
  
  // If no cache or expired, fetch from server
  const serverData = await serverLoader();
  dashboardCache.set(serverData);
  return serverData;
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const serverResponse = await serverAction();
  matchCache.invalidate(serverResponse.updatedMatchId);
  matchesCache.invalidateAll();
  dashboardCache.invalidate(); // Also invalidate dashboard cache when scores change
  return {
    updateStatus: "Success",
    updatedRecord: serverResponse.updatedMatchId,
  };
}

export default function Dashboard({}: Route.ComponentProps) {
  const data = useLoaderData<typeof clientLoader>();
  const [clickCount, setClickCount] = useState(0);
  const showAddMatchDetails = clickCount > 5 || import.meta.env.DEV;
  
  return (
    <div>
      <div className="p-4">
        <div className="flex justify-between items-baseline mb-4">
          <h1
            className="text-2xl font-bold mb-4"
            onClick={() => setClickCount(clickCount + 1)}
          >
            Dashboard
          </h1>
          {showAddMatchDetails && <AddEditMatchDetails />}
        </div>
        <ScoreCard />
      </div>
    </div>
  );
}
// ... existing code ...
```

---

_**User**_

This looks great. Let's add a button above the dashboard to invalidate the cache and do a refresh. Use a reload icon from lucide react. 

---

_**Assistant**_

I'll add a refresh button with a reload icon from Lucide React. Here's the implementation:

```typescript:app/routes/dashboard.tsx
import type { Route } from "./+types/dashboard";
import { prisma } from "~/utils/db.server";
import { AddEditMatchDetails } from "~/components/common/AddEditMatchDetails";
import { ScoreCard } from "~/components/overallscore/scorecard";
import { useState } from "react";
import { matchCache } from "~/utils/match-cache.client";
import { matchesCache } from "~/utils/matches-cache.client";
import { dashboardCache } from "~/utils/dashboard-cache.client";
import { useRevalidator } from "@remix-run/react";
import { RefreshCw } from "lucide-react";

// ... existing code ...

export default function Dashboard({}: Route.ComponentProps) {
  const [clickCount, setClickCount] = useState(0);
  const showAddMatchDetails = clickCount > 5 || import.meta.env.DEV;
  const revalidator = useRevalidator();
  
  const handleRefresh = () => {
    dashboardCache.invalidate();
    revalidator.revalidate();
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex justify-between items-baseline mb-4">
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl font-bold"
              onClick={() => setClickCount(clickCount + 1)}
            >
              Dashboard
            </h1>
            <button 
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Refresh dashboard"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${revalidator.state === 'loading' ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {showAddMatchDetails && <AddEditMatchDetails />}
        </div>
        <ScoreCard />
      </div>
    </div>
  );
}
```

---



---

