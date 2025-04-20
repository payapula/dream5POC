import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
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
    label: "Assassino",
    color: "var(--chart-1)",
  },
  user2: {
    label: "Naveen",
    color: "var(--chart-2)",
  },
  user3: {
    label: "HP",
    color: "var(--chart-3)",
  },
  user4: {
    label: "BK",
    color: "var(--chart-4)",
  },
  user5: {
    label: "Bala",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function VerticalBarChart() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Match History</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="match"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="user1" fill="var(--chart-1)" radius={4} />
            <Bar dataKey="user2" fill="var(--chart-2)" radius={4} />
            <Bar dataKey="user3" fill="var(--chart-3)" radius={4} />
            <Bar dataKey="user4" fill="var(--chart-4)" radius={4} />
            <Bar dataKey="user5" fill="var(--chart-5)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
