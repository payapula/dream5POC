## SpecStory

## User Selection for History Chart (12/04/2025, 16:05:02)

_**User**_

In history chart, currently we are displaying all 5 user data in chart. 

Let's add ability for users to select number users data to be plotted in the chart. 

Each user can be listed as a label with checkbox next to them. And we would need to have one more option "All". By default "All" should be selected. 

When user updates the number users from the checkbox input, our chart should refresh and show only "checked" user's data. 

Manage the checkbox handling with Select All functionalities similar to best user experience patterns. Also separate the components as needed to not crowd all data in single component.

Give me a overall high plan of how we are going approach this first, and then lets do the actual edits

---

_**Assistant**_



---

_****_

# Plan for User Selection in History Chart

1. **Component Structure**
   - Create a `UserSelector` component with checkboxes for each user and an "All" option
   - Keep chart rendering in `HistoryChart` 
   - Pass selected users as props between components

2. **State Management**
   - Add state to track selected users using React's useState
   - Default to "All" selected (all users visible)

3. **Filter Implementation**
   - Filter chart data based on selected users
   - Create derived data for the chart that only includes selected users
   - Dynamically render only Line components for selected users

4. **UX for Selection**
   - "All" option toggles all checkboxes
   - Individual selections update the "All" checkbox state
   - When all users selected manually, "All" becomes checked

5. **Styling**
   - Use ShadcnUI components for checkboxes
   - Mobile-friendly layout for filters

Let me know if you'd like to proceed with the implementation.

---

_**User**_

Yes, let's proceed with implementation.

---

_**Assistant**_



---

_****_

```tsx:app/components/charts/history/HistoryChart.tsx
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// ... existing code ...

// Create a UserSelector component
function UserSelector({ 
  config, 
  selectedUsers, 
  onChange 
}: { 
  config: ChartConfig; 
  selectedUsers: string[]; 
  onChange: (selected: string[]) => void;
}) {
  const userKeys = Object.keys(config);
  const allSelected = selectedUsers.length === userKeys.length;
  
  const handleSelectAll = () => {
    onChange(allSelected ? [] : [...userKeys]);
  };

  const handleUserToggle = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onChange(selectedUsers.filter(id => id !== userId));
    } else {
      onChange([...selectedUsers, userId]);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2 mb-2">
        <Checkbox 
          id="select-all" 
          checked={allSelected} 
          onCheckedChange={handleSelectAll} 
        />
        <Label htmlFor="select-all">All Users</Label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {userKeys.map(userId => (
          <div key={userId} className="flex items-center space-x-2">
            <Checkbox 
              id={userId} 
              checked={selectedUsers.includes(userId)}
              onCheckedChange={() => handleUserToggle(userId)}
            />
            <Label 
              htmlFor={userId} 
              className="flex items-center"
            >
              <span 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: config[userId].color }} 
              />
              {config[userId].label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryChart() {
  const userKeys = Object.keys(chartConfig);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(userKeys);

  // Filter lines to only show selected users
  const filteredData = chartData.map(dataPoint => {
    const filteredPoint = { match: dataPoint.match };
    selectedUsers.forEach(user => {
      filteredPoint[user] = dataPoint[user];
    });
    return filteredPoint;
  });

  return (
    <Card className="py-4 mt-16">
      <CardHeader>
        <CardTitle>Scores Trend</CardTitle>
        <CardDescription>March 2025 - April 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <UserSelector 
          config={chartConfig} 
          selectedUsers={selectedUsers} 
          onChange={setSelectedUsers} 
        />
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
            {/* Only render lines for selected users */}
            {selectedUsers.includes("user1") && (
              <Line
                dataKey="user1"
                type="monotone"
                stroke="#2563eb"
                strokeWidth={2}
                dot={true}
              />
            )}
            {selectedUsers.includes("user2") && (
              <Line
                dataKey="user2"
                type="monotone"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={true}
              />
            )}
            {selectedUsers.includes("user3") && (
              <Line
                dataKey="user3"
                type="monotone"
                stroke="#93c5fd"
                strokeWidth={2}
                dot={true}
              />
            )}
            {selectedUsers.includes("user4") && (
              <Line
                dataKey="user4"
                type="monotone"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={true}
              />
            )}
            {selectedUsers.includes("user5") && (
              <Line
                dataKey="user5"
                type="monotone"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={true}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

---



---

