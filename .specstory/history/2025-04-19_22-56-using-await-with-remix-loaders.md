## SpecStory

## Using Await with Remix Loaders (19/04/2025, 22:56:52)

_**User**_

@https://reactrouter.com/api/components/Await  

From the docs above, I am trying to return/stream the data from my remix loader to the component. So I have wrapped the existing code into new promise on line 32 and returned as is from the laoder.

My idea is: I want to return the Promise as is from the loader of @dashboard.tsx file and use `Await` in @scorecard.tsx to load the data with Suspense. But I think I am doing something wrong in my loader. 

It's still returning the resolved response. How to I fix this?

---

_**Assistant**_

Let me help you understand how to properly implement streaming with `Await` in your React Router application. Looking at your code, I can see why the data is being resolved immediately.

The issue is in your loader implementation. Currently, you're creating a Promise and immediately awaiting all the data before returning it. To properly use `Await`, you need to return the unresolved promises directly from the loader. Here's how you can modify your code:

First, let's fix the loader in `dashboard.tsx`:

```typescript:path=app/routes/dashboard.tsx
export async function loader({}: Route.LoaderArgs): Promise<DashboardLoaderData> {
  // Return the promises directly without awaiting them
  const usersPromise = prisma.user.findMany();
  const scoresPromise = prisma.userScore.findMany({
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
      user: true,
    },
  }) as Promise<ScoreWithRelations[]>;

  // Return the promises and data processing function
  return {
    users: usersPromise,
    scores: scoresPromise,
    // You can also defer the processing logic
    processData: async () => {
      const [users, allScores] = await Promise.all([usersPromise, scoresPromise]);
      
      if (!allScores || allScores.length === 0) {
        return {
          users: users.map((u, index) => ({
            id: u.id,
            name: u.name,
            displayName: u.displayName,
            totalScore: 0,
            matchesWon: 0,
            matchesLost: 0,
            ranking: index + 1,
            oneUp: 0,
          })),
          totalMatches: 0,
          lastMatch: null,
        };
      }

      const scoresByMatch = groupScoresByMatch(allScores);
      const matchStats = calculateMatchStats(scoresByMatch);
      const lastMatch = findLastMatch(scoresByMatch);
      const userStats = calculateAllUserStats(users, allScores, matchStats);
      const rankedUsers = rankUsers(userStats);

      return {
        users: rankedUsers,
        totalMatches: Object.keys(scoresByMatch).length,
        lastMatch,
      };
    }
  };
}
```

Then, modify your `ScoreCard` component to use `Await`:

```typescript:path=app/components/overallscore/scorecard.tsx
import { Await, useLoaderData } from "react-router";
import { Suspense } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { loader as DashboardLoader } from "~/routes/dashboard";

export function ScoreCard() {
  const data = useLoaderData<typeof DashboardLoader>();

  return (
    <div className="container mx-auto">
      <Suspense fallback={<div>Loading scores...</div>}>
        <Await
          resolve={data.processData()}
          errorElement={<div>Error loading scores</div>}
        >
          {(resolvedData) => (
            <>
              <div className="text-sm text-gray-500 mb-4">
                Total Matches Completed: {resolvedData.totalMatches}
              </div>
              <DataTable columns={columns} data={resolvedData.users} />
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
```

The key differences in this implementation are:

1. The loader now returns unresolved promises instead of awaiting them immediately
2. We've moved the data processing logic into a separate function that can be resolved later
3. The component uses `Suspense` and `Await` to handle the loading state
4. The resolved data is rendered using a render prop pattern within `Await`

This approach will give you true streaming capabilities where:
- The page can load immediately while data is being fetched
- You can show loading states with `Suspense`
- The data will be streamed to the client as it becomes available
- Error boundaries will catch any errors during the data fetching process

Remember that `Await` must always be wrapped in a `Suspense` boundary to handle the loading state while the promise is being resolved.

[Source: React Router Await Documentation](https://reactrouter.com/api/components/Await)

---

_**User**_

I am getting a typescript error in @scorecard.tsx for data.processData() due to mismatched typesa in @dashboard.ts file, Can you help me fix it to match @dashboard.tsx loader?

---

_**Assistant**_

Looking at your types in `dashboard.ts` and the loader implementation in `dashboard.tsx`, I can help fix the type mismatch. The issue is that your `DashboardLoaderData` interface needs to be updated to match the actual structure of what your loader returns.

Let's update the types in `dashboard.ts`:

```typescript:path=app/routes/types/dashboard.ts
// Update the DashboardLoaderData interface to match the loader return type
export interface DashboardLoaderData {
  users: Promise<User[]>;
  scores: Promise<ScoreWithRelations[]>;
  processData: () => Promise<{
    users: {
      id: string;
      name: string;
      displayName: string;
      totalScore: number;
      matchesWon: number;
      matchesLost: number;
      ranking: number;
      oneUp: number;
    }[];
    totalMatches: number;
    lastMatch: LastMatch | null;
  }>;
}
```

The key changes are:
1. Added `users` and `scores` properties as Promises to match what the loader returns
2. Kept the `processData` function type as is since it correctly represents the processing function

This should resolve the TypeScript error in your `scorecard.tsx` component since now the types accurately reflect what your loader is returning:
- Raw promises for `users` and `scores`
- A processing function that returns a promise with the processed data

The type now matches exactly what your loader in `dashboard.tsx` is returning:
```typescript
return {
  users: usersPromise,
  scores: scoresPromise,
  processData: async () => {
    // ... processing logic ...
  }
};
```

This should resolve the TypeScript error you're seeing in `scorecard.tsx` when calling `data.processData()`.

---



---

