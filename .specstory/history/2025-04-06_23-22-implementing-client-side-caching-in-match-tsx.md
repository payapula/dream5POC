## SpecStory

## Implementing Client-Side Caching in Match.tsx (06/04/2025, 23:22:14)

_**User**_

Similar to clientLoader and caching implemented in @matches.tsx file, implement client side caching in @match.tsx file to catch the match response. 

---

_**Assistant**_

```typescript:app/routes/match.tsx
// ... existing code ...
let isInitialRequest = true;
let cache = new Map();

export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
  const matchId = params.matchId;
  const cacheKey = `match-${matchId}`;

  if (isInitialRequest) {
    isInitialRequest = false;
    const serverData = await serverLoader();
    cache.set(cacheKey, serverData);
    return serverData;
  }

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const serverData = await serverLoader();
  cache.set(cacheKey, serverData);
  return serverData;
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Match Result</h1>
      <div className="animate-pulse">
        <div className="h-24 bg-gray-200 rounded mb-4"></div>
      </div>
    </div>
  );
}
// ... existing code ...
```

---



---

