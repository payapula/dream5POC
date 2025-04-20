import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface VerticalBarChartProps {
  filteredData: any[];
  selectedUsers: string[];
  chartConfig: ChartConfig;
}

export function VerticalBarChart({
  filteredData,
  selectedUsers,
  chartConfig,
}: VerticalBarChartProps) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Match Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={filteredData}>
            <CartesianGrid vertical={false} />
            {/*  TODO: Add max axis later?
            
            <YAxis
              dataKey="max"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
            /> */}
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
            {selectedUsers.map((userKey) => (
              <Bar
                key={userKey}
                dataKey={userKey}
                fill={chartConfig[userKey]?.color || "#000"}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
