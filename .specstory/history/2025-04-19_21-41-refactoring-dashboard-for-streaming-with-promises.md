## SpecStory

## Refactoring Dashboard for Streaming with Promises (19/04/2025, 21:41:55)

_**User**_

I am plannng to do a streaming from remix/react-router loaders to the components. Instead of awaiting for DB responses and calculating the results on loader, we need to send the promises as is from loaders and use react-router/remix's `Await` component to stream the results in the dashboard route. 

So, let's split the logic on dashboard and let's introduce this change approriately. @dashboard.tsx 

---

_**Assistant**_

Okay, I understand. You want to refactor the `dashboard.tsx` loader to return promises for different data parts, allowing you to use `react-router`'s `Await` component for streaming.

This is a great approach for improving perceived performance, especially on slower connections or for complex data fetching.

Here's how we can modify the `dashboard.tsx` file:

1.  **Split Loader Logic:** We'll create separate async functions within `dashboard.tsx` that correspond to the different data fetching and processing steps currently in the loader. Each of these functions will return a promise.
2.  **Update Loader:** The `loader` function will now call these new functions and return an object where the values are promises.
3.  **Update Component:** The `Dashboard` component will use `useLoaderData` to get these promises and wrap the rendering of components like `ScoreCard` and `LastMatchStats` within `Await` components, providing appropriate fallbacks.

Let's start by modifying the `dashboard.tsx` file. We'll extract the data fetching and processing logic into helper functions.

```typescript:app/routes/dashboard.tsx
// ... existing imports ...
import { defer } from "react-router"; // Import defer

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dream5 | Dashboard" }];
}

let isInitialRequest = true;

// --- New Helper Functions for Streaming ---

async function getUsers() {
  return prisma.user.findMany();
}

async function getAllScores() {
  return prisma.userScore.findMany({
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
      user: true,
    },
  });
}

async function getMatchStats(allScoresPromise: Promise<typeof allScores>) {
  const allScores = await allScoresPromise;

  // Group scores by match
  const scoresByMatch = allScores.reduce((acc, score) => {
    if (!acc[score.matchId]) {
      acc[score.matchId] = [];
    }
    acc[score.matchId].push(score);
    return acc;
  }, {} as Record<string, typeof allScores>);

  // Pre-calculate highest and lowest scores for each match
  const matchStats = Object.entries(scoresByMatch).reduce(
    (acc, [matchId, scores]) => {
      acc[matchId] = {
        highestScore: Math.max(...scores.map((s) => s.score)),
        lowestScore: Math.min(...scores.map((s) => s.score)),
      };
      return acc;
    },
    {} as Record<string, { highestScore: number; lowestScore: number }>
  );

  return { scoresByMatch, matchStats, totalMatches: Object.keys(scoresByMatch).length };
}


async function getUserRankings(usersPromise: Promise<ReturnType<typeof getUsers>>, matchStatsPromise: Promise<ReturnType<typeof getMatchStats>>, allScoresPromise: Promise<ReturnType<typeof getAllScores>>) {
  const users = await usersPromise;
  const { matchStats } = await matchStatsPromise;
  const allScores = await allScoresPromise;

  // Calculate stats for each user
  const userStats = users.map((user) => {
    const userScores = allScores.filter((score) => score.userId === user.id);

    // Use proper decimal addition
    const totalScore = Number(
      userScores.reduce((sum, score) => sum + score.score, 0).toFixed(1)
    );

    let matchesWon = 0;
    let matchesLost = 0;

    // Now we use the pre-calculated stats with floating point comparison
    userScores.forEach((score) => {
      const stats = matchStats[score.matchId];
      /**
       * If any match is not played (or missed by entire team), the stats will be 0
       * This is a hack to avoid calculating matches not played as won or lost
       */
      if (stats?.highestScore > 0 && stats?.lowestScore > 0) { // Added nullish check for stats
        if (Math.abs(score.score - stats.highestScore) < 0.001) matchesWon++;
        if (Math.abs(score.score - stats.lowestScore) < 0.001) matchesLost++;
      }
    });

    return {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      totalScore,
      matchesWon,
      matchesLost,
    };
  });

  // Sort by total score (descending) to determine ranking
  const rankedData = userStats
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((user, index, array) => ({
      ...user,
      ranking: index + 1,
      oneUp: index > 0 ? array[index - 1].totalScore - user.totalScore : 0,
    }));

  return rankedData;
}

async function getLastMatchDetails(matchStatsPromise: Promise<ReturnType<typeof getMatchStats>>, allScoresPromise: Promise<ReturnType<typeof getAllScores>>) {
  const { scoresByMatch } = await matchStatsPromise;
  const allScores = await allScoresPromise;

  let lastMatch = null;
  let lastMatchDate = new Date(0);

  // Find the most recent match
  Object.entries(scoresByMatch).forEach(([matchId, scores]) => {
    const matchDate = new Date(scores[0].match.date);
    if (matchDate > lastMatchDate) {
      lastMatchDate = matchDate;

      // Get unique match data
      const matchData = scores[0].match;

      // Calculate highest score for this match
      const highestScore = Math.max(...scores.map((s) => s.score));

      // Get users with the highest score
      const winnersIds = scores
        .filter((score) => Math.abs(score.score - highestScore) < 0.001)
        .map((score) => score.userId);

      lastMatch = {
        id: matchId,
        date: matchData.date,
        matchNumber: matchData.matchNumber,
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        userScores: scores,
        winnersIds,
        highestScore,
      };
    }
  });

  return lastMatch;
}


// --- Updated Loader Function ---
export async function loader({}: Route.LoaderArgs): Promise<Response> { // Return Response for defer
  // Start fetching data concurrently
  const usersPromise = getUsers();
  const allScoresPromise = getAllScores();

  // Await necessary data for initial render or for subsequent calculations
  const [users, allScores] = await Promise.all([usersPromise, allScoresPromise]);

  // Use promises for parts that can stream
  const matchStatsPromise = getMatchStats(Promise.resolve(allScores)); // Pass the awaited scores to avoid refetching
  const userRankingsPromise = getUserRankings(Promise.resolve(users), matchStatsPromise, Promise.resolve(allScores)); // Pass awaited users and scores
  const lastMatchDetailsPromise = getLastMatchDetails(matchStatsPromise, Promise.resolve(allScores)); // Pass awaited scores

  const { totalMatches } = await matchStatsPromise; // Await totalMatches for the initial render (ScoreCard heading)


  return defer({
    users: userRankingsPromise, // Promise for ranked users
    totalMatches: totalMatches, // Awaited value for total matches
    lastMatch: lastMatchDetailsPromise, // Promise for last match details
  });
}

const userKeyMapping: Record<string, string> = {
  User1: "1",
  User2: "2",
  User3: "3",
  User4: "4",
  User5: "5",
};

export async function action({ request }: Route.ActionArgs) {
  let formData = await request.formData();
  let upserts = [];
  const matchId = formData.get("matchId") as string;

  for (const [key, value] of formData) {
    if (key in userKeyMapping && key !== "matchId") {
      const userId = userKeyMapping[key];
      upserts.push(
        prisma.userScore.upsert({
          where: {
            userId_matchId: {
              userId,
              matchId,
            },
          },
          update: {
            score: Number(value),
          },
          create: {
            userId,
            matchId,
            score: Number(value),
          },
        })
      );
    }
  }

  await prisma.$transaction(upserts);

  return {
    updateStatus: "Success",
    updatedMatchId: matchId,
  };
}

// clientLoader and HydrateFallback remain largely the same,
// as they handle the initial load and hydration, potentially before streaming fully completes.
export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  if (isInitialRequest) {
    isInitialRequest = false;
    const serverData = await serverLoader();
    // Note: dashboardCache will now store promises, which is fine for revalidation purposes
    dashboardCache.set(serverData);
    return serverData;
  }

  // Check if we have cached data
  const cachedData = dashboardCache.get();
  if (cachedData) {
    // If cached, we still return the object containing promises
    return cachedData;
  }

  // If no cache or expired, fetch from server
  const serverData = await serverLoader();
  dashboardCache.set(serverData);
  return serverData;
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <div>
      <div className="p-4">
        <div className="flex justify-between items-baseline mb-4">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        </div>
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const serverResponse = await serverAction();
  matchCache.invalidate(serverResponse.updatedMatchId);
  matchesCache.invalidateAll();
  dashboardCache.invalidate(); // Invalidate dashboard cache to trigger a re-fetch/revalidation
  return {
    updateStatus: "Success",
    updatedRecord: serverResponse.updatedMatchId,
  };
}

// --- Updated Dashboard Component ---
import { useLoaderData, Await } from "react-router"; // Import Await
import { ScoreCard } from "~/components/overallscore/scorecard";
import { LastMatchStats } from "~/components/lastmatch/LastMatchStats";
// Add a basic loading spinner/skeleton for Await fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-32">
    <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
  </div>
);


export default function Dashboard({}: Route.ComponentProps) {
  const [clickCount, setClickCount] = useState(0);
  const showAddMatchDetails = clickCount > 5 || import.meta.env.DEV;
  const revalidator = useRevalidator();

  // Loader data now contains promises
  const data = useLoaderData<typeof clientLoader>();
  const { users, totalMatches, lastMatch } = data;

  const handleRefresh = () => {
    // Invalidate the cache and revalidate the route
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
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${
                  revalidator.state === "loading" ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          {showAddMatchDetails && <AddEditMatchDetails />}
        </div>

        {/* Render ScoreCard with Await */}
        <Await resolve={users} errorElement={<div>Error loading score card!</div>}>
          {(resolvedUsers) => (
             // Pass the resolved users and the totalMatches (which was awaited in the loader)
            <ScoreCard users={resolvedUsers} totalMatches={totalMatches} />
          )}
        </Await>

        {/* Render LastMatchStats with Await */}
        <Await resolve={lastMatch} errorElement={<div>Error loading last match stats!</div>} fallback={<LoadingSpinner />}>
          {(resolvedLastMatch) => (
             // Pass the resolved last match data
            resolvedLastMatch ? <LastMatchStats lastMatch={resolvedLastMatch} /> : null // Render only if last match exists
          )}
        </Await>
      </div>
    </div>
  );
}

```

**Explanation of Changes:**

1.  **`defer` Import and Return:** We imported `defer` from `react-router` and changed the `loader` function's return type hint to `Promise<Response>`. The loader now uses `defer` to return an object containing promises (`users`, `lastMatch`) and an eagerly awaited value (`totalMatches`).
2.  **Helper Functions:** The core logic for fetching users, scores, calculating stats, and finding the last match has been moved into separate `async` functions (`getUsers`, `getAllScores`, `getMatchStats`, `getUserRankings`, `getLastMatchDetails`). These functions return promises.
3.  **Loader Refactor:** The `loader` now calls these helper functions to get promises. Some promises depend on the results of others (e.g., `getUserRankings` needs users, match stats, and all scores), so we use `Promise.all` to await the initial necessary data (`users`, `allScores`) and then pass the *awaited* results (wrapped back in `Promise.resolve`) or the dependent promises to the subsequent helper functions. This ensures data dependencies are handled correctly while still allowing streaming. We also eagerly await `totalMatches` as it's a small value needed early for the `ScoreCard` header.
4.  **`Await` Component:** In the `Dashboard` component, we imported `Await`. We now use `<Await>` components to wrap the rendering of `ScoreCard` and `LastMatchStats`.
    *   The `resolve` prop of `Await` takes the promise from the loader data (e.g., `data.users`).
    *   The children of `Await` are a function that receives the *resolved* value of the promise. This function's return value is rendered when the promise resolves.
    *   We added `errorElement` to handle potential errors during promise resolution.
    *   We added a basic `fallback` (a spinner) for `LastMatchStats` to show something while the data is loading.
5.  **Component Props:** The `ScoreCard` and `LastMatchStats` components now receive their data directly as props (`users` and `lastMatch`, respectively) from the `Await` component's render function, instead of calling `useLoaderData` internally. **Note:** You will need to update the `ScoreCard.tsx` and `LastMatchStats.tsx` components to accept these props.

**Next Steps:**

You need to update the `app/components/overallscore/scorecard.tsx` and `app/components/lastmatch/LastMatchStats.tsx` components to accept their respective data as props instead of using `useLoaderData`.

For example, in `app/components/overallscore/scorecard.tsx`:

```typescript:app/components/overallscore/scorecard.tsx
import { columns } from "./columns";
import { DataTable } from "./data-table";
// Remove useLoaderData import
// import type { loader as DashboardLoader } from "~/routes/dashboard"; // This import might change or be removed

// Define props interface
interface ScoreCardProps {
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
}

// Accept props
export function ScoreCard({ users, totalMatches }: ScoreCardProps) {
  // Remove useLoaderData call
  // const { users, totalMatches } = useLoaderData<typeof DashboardLoader>();

  return (
    <div className="container mx-auto">
      <div className="text-sm text-gray-500 mb-4">
        Total Matches Completed: {totalMatches}
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
```

And similarly for `LastMatchStats.tsx`. Let me know if you'd like help updating those component files as well!

---



---

