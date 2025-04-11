import { useLoaderData } from "react-router";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { type ChartConfig, ChartContainer } from "~/components/ui/chart";
import type { DashboardLoaderData } from "~/routes/types/dashboard";

const chartData = [
  { user: "User 1", score: 500 },
  { user: "User 2", score: 305 },
  { user: "User 3", score: 237 },
  { user: "User 4", score: 73 },
  { user: "User 5", score: 209 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export function OverallChart() {
  const { users } = useLoaderData<DashboardLoaderData>();

  const chartData = users.map((user) => ({
    user: user.displayName,
    score: user.totalScore,
  }));

  return (
    <Card className="mb-6 bg-white shadow-sm mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center">
          Standings
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <XAxis type="number" dataKey="score" hide />
            <YAxis
              dataKey="user"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              padding={{
                top: 8,
                bottom: 8,
              }}
            />
            <Bar
              dataKey="score"
              fill="var(--color-desktop)"
              radius={4}
              barSize={25}
              label={{
                position: "center",
                fill: "white",
                formatter: (value: number) => value.toLocaleString("en-IN"),
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
