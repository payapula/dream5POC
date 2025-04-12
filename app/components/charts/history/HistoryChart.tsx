import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

const chartData = [
  { match: 1, user1: 87, user2: 45, user3: 73, user4: 28, user5: 91 },
  { match: 2, user1: 32, user2: 91, user3: 45, user4: 67, user5: 12 },
  { match: 3, user1: 76, user2: 64, user3: 89, user4: 34, user5: 56 },
  { match: 4, user1: 23, user2: 55, user3: 17, user4: 95, user5: 83 },
  { match: 5, user1: 95, user2: 42, user3: 61, user4: 39, user5: 44 },
  { match: 6, user1: 61, user2: 83, user3: 29, user4: 72, user5: 65 },
];

const chartConfig = {
  user1: {
    label: "User 1",
    color: "#2563eb",
  },
  user2: {
    label: "User 2",
    color: "#60a5fa",
  },
  user3: {
    label: "User 3",
    color: "#93c5fd",
  },
  user4: {
    label: "User 4",
    color: "#3b82f6",
  },
  user5: {
    label: "User 5",
    color: "#1d4ed8",
  },
} satisfies ChartConfig;

export function HistoryChart() {
  return (
    <Card className="py-4 mt-16">
      <CardHeader>
        <CardTitle>Scores Trend</CardTitle>
        <CardDescription>March 2025 - April 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="match"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="user1"
              type="monotone"
              stroke="#2563eb"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="user2"
              type="monotone"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="user3"
              type="monotone"
              stroke="#93c5fd"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="user4"
              type="monotone"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="user5"
              type="monotone"
              stroke="#1d4ed8"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
