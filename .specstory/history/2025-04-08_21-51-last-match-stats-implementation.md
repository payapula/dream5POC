## SpecStory

## Last Match Stats Implementation (08/04/2025, 21:51:02)

_**User**_

In the dashboard let's add a card to show the last match details and the winner of the match. 

The last match can be calculated by checking the match date (refer to @schema.prisma ). 

We will use the same `loader` in @dashboard.tsx file to send in the last match details.

Lets create a new component called <LastMatchStats /> and add data there. Let's implement this requirement in step by step manner, 2 files at a time. Feel free to ask more questions if you have any. 

---

_**Assistant**_

I'll implement a LastMatchStats component to show the last match details and the winner in the dashboard. Let's start with modifying the loader function in dashboard.tsx to include the last match data, then create the new component.

---

_****_

<details>
            <summary>Searched codebase "components/overallscore/scorecard.tsx" • **1** results</summary>
        
| File |
|------|
| `undefined` |

</details>

---

_****_

Read file: undefined

---

_****_

Now, let's update the dashboard.tsx loader to fetch the last match details:

---

_****_

Read file: undefined

---

_****_

Read file: undefined

---

_****_

Now, let's start implementing the solution by updating the loader function in dashboard.tsx to include the last match data, and then create the LastMatchStats component:

### Step 1: Update the loader function in dashboard.tsx

```typescript:app/routes/dashboard.tsx
import type { Route } from "./+types/dashboard";
import { prisma } from "~/utils/db.server";
import { AddEditMatchDetails } from "~/components/common/AddEditMatchDetails";
import { ScoreCard } from "~/components/overallscore/scorecard";
import { LastMatchStats } from "~/components/lastmatch/LastMatchStats";
import { useState } from "react";
import { matchCache } from "~/utils/match-cache.client";
import { matchesCache } from "~/utils/matches-cache.client";
import { dashboardCache } from "~/utils/dashboard-cache.client";
import { useRevalidator } from "react-router";
import { RefreshCw } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dream5 | Dashboard" }];
}

let isInitialRequest = true;

export async function loader({}: Route.LoaderArgs) {
  // Get all users
  const users = await prisma.user.findMany();

  // Get all scores
  const allScores = await prisma.userScore.findMany({
    include: {
      match: true,
    },
  });

  // Get the last match details
  const lastMatch = await prisma.match.findFirst({
    orderBy: {
      date: 'desc'
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      userScores: {
        include: {
          user: true
        }
      }
    }
  });

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
      if (stats.highestScore > 0 && stats.lowestScore > 0) {
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

  // Determine the winner of the last match if available
  let lastMatchWithWinner = null;
  if (lastMatch) {
    // Find the highest score in the last match
    const highestScore = Math.max(...lastMatch.userScores.map(score => score.score));
    
    // Get users with the highest score
    const winnersIds = lastMatch.userScores
      .filter(score => Math.abs(score.score - highestScore) < 0.001)
      .map(score => score.userId);

    lastMatchWithWinner = {
      ...lastMatch,
      winnersIds,
      highestScore
    };
  }

  return { 
    users: rankedData, 
    totalMatches: Object.keys(scoresByMatch).length,
    lastMatch: lastMatchWithWinner
  };
}

// ... rest of the file remains the same
```

### Step 2: Create the LastMatchStats component

Now let's create the LastMatchStats component:

```typescript:app/components/lastmatch/LastMatchStats.tsx
import { useLoaderData } from "react-router";
import { format } from "date-fns";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { loader as DashboardLoader } from "~/routes/dashboard";

export function LastMatchStats() {
  const { lastMatch } = useLoaderData<typeof DashboardLoader>();

  if (!lastMatch) {
    return (
      <Card className="mb-6 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Latest Match</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No matches found yet.</p>
        </CardContent>
      </Card>
    );
  }

  const matchDate = new Date(lastMatch.date);
  const formattedDate = format(matchDate, "PPP"); // Long date format

  return (
    <Card className="mb-6 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Latest Match</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-500">{formattedDate}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="font-medium">{lastMatch.homeTeam.name}</p>
              </div>
              <div className="text-xs px-2">vs</div>
              <div className="text-center flex-1">
                <p className="font-medium">{lastMatch.awayTeam.name}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-medium mb-2">Top Performers</p>
            <div className="space-y-2">
              {lastMatch.userScores
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((score, index) => (
                  <div key={score.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {index === 0 && (
                        <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                      )}
                      <span className="text-sm">{score.user.displayName}</span>
                    </div>
                    <span className="font-medium">{score.score.toFixed(1)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Update the Dashboard component to include LastMatchStats

```typescript:app/routes/dashboard.tsx
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
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${
                  revalidator.state === "loading" ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          {showAddMatchDetails && <AddEditMatchDetails />}
        </div>
        <LastMatchStats />
        <ScoreCard />
      </div>
    </div>
  );
}
```

These changes will:
1. Fetch the latest match from the database based on the match date
2. Include team information and user scores for the match
3. Calculate the winners of the match based on the highest score
4. Create a LastMatchStats component that displays the match details
5. Show the top 3 performers in the match, with a trophy icon for the winner
6. Update the Dashboard to display the LastMatchStats component above the ScoreCard

Does this implementation work for you? Would you like me to make any adjustments to these components?

---

_**User**_

Instead of adding a new prisma query `prisma.match.findFirst`, can't we reuse the `allScores` data? As it already retrieves match information for all users? Try to optimise this. Send in only the updates required in @dashboard.tsx file, once completing it let's move to other files.

---

_**Assistant**_

You're right, we can optimize by reusing the existing `allScores` data instead of making an additional Prisma query. Here's the updated approach for the dashboard.tsx loader function:

```typescript:app/routes/dashboard.tsx
export async function loader({}: Route.LoaderArgs) {
  // Get all users
  const users = await prisma.user.findMany();

  // Get all scores
  const allScores = await prisma.userScore.findMany({
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        }
      },
      user: true,
    },
  });

  // Group scores by match
  const scoresByMatch = allScores.reduce((acc, score) => {
    if (!acc[score.matchId]) {
      acc[score.matchId] = [];
    }
    acc[score.matchId].push(score);
    return acc;
  }, {} as Record<string, typeof allScores>);

  // Find the latest match from the scores
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
      const highestScore = Math.max(...scores.map(s => s.score));
      
      // Get users with the highest score
      const winnersIds = scores
        .filter(score => Math.abs(score.score - highestScore) < 0.001)
        .map(score => score.userId);

      lastMatch = {
        id: matchId,
        date: matchData.date,
        matchNumber: matchData.matchNumber,
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        userScores: scores,
        winnersIds,
        highestScore
      };
    }
  });

  // Pre-calculate highest and lowest scores for each match
  const matchStats = Object.entries(scoresByMatch).reduce(
    (acc, [matchId, scores]) => {
      acc[matchId] = {
        highestScore: Math.max(...scores.map((s) => s.score)),
        lowestScore: Math.min(...scores.map((s) => s.score)),
      };
      return acc

---



---

