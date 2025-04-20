import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { match: 1, user1: 87, user2: 45, user3: 73, user4: 28, user5: 91 },
  { match: 2, user1: 32, user2: 91, user3: 45, user4: 67, user5: 12 },
  { match: 3, user1: 76, user2: 64, user3: 89, user4: 34, user5: 56 },
  { match: 4, user1: 23, user2: 55, user3: 17, user4: 95, user5: 83 },
  { match: 5, user1: 95, user2: 42, user3: 61, user4: 39, user5: 44 },
  { match: 6, user1: 61, user2: 83, user3: 29, user4: 72, user5: 65 },
];

export interface HistoryChartProps {
  filteredData: any[];
  selectedUsers: string[];
  chartConfig: ChartConfig;
}

export function HistoryChart({
  filteredData,
  selectedUsers,
  chartConfig,
}: HistoryChartProps) {
  return (
    <Card className="py-4 mt-8">
      <CardHeader>
        <CardTitle>Scores Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={filteredData}
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
            {selectedUsers.map((userKey) => (
              <Line
                key={userKey}
                dataKey={userKey}
                type="monotone"
                stroke={chartConfig[userKey]?.color || "#000"}
                strokeWidth={2}
                dot={true}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
