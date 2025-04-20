import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ChartConfig } from "@/components/ui/chart";

export const chartConfig = {
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

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      <span className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}

export function UserSelector({
  config,
  selectedUsers,
  onChange,
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
      onChange(selectedUsers.filter((id) => id !== userId));
    } else {
      onChange([...selectedUsers, userId]);
    }
  };

  return (
    <div className="mb-4 mt-4">
      <div className="flex items-center space-x-2 mb-6 px-2">
        <Checkbox
          id="select-all"
          checked={allSelected}
          onCheckedChange={handleSelectAll}
        />
        <Label htmlFor="select-all">All Users</Label>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {userKeys.map((userId) => (
          <div key={userId} className="flex items-center space-x-2 p-2">
            <Checkbox
              id={userId}
              checked={selectedUsers.includes(userId)}
              onCheckedChange={() => handleUserToggle(userId)}
            />
            <Label htmlFor={userId} className="flex items-center">
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
