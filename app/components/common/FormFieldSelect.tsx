import { type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetcher } from "react-router";
import { useEffect } from "react";
import type { loader as MatchListLoader } from "~/routes/match-list";

export function FormFieldSelect({
  form,
  name,
}: {
  form: UseFormReturn<any>;
  name: string;
}) {
  const fetcher = useFetcher<typeof MatchListLoader>({
    key: "match-list",
  });

  useEffect(() => {
    fetcher.load("/match-list");
  }, []);

  const { data } = fetcher;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Match</FormLabel>
          {fetcher.state === "loading" ? (
            <div>Loading...</div>
          ) : (
            fetcher.data?.matches && (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a match" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {data?.matches?.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      {match.matchNumber} | {match.homeTeam.name} VS{" "}
                      {match.awayTeam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
