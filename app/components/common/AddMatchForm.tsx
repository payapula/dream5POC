import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormFieldSelect } from "./FormFieldSelect";
import { useFetcher, useLoaderData } from "react-router";
import type { loader as MatchListLoader } from "~/routes/match-list";
import type { loader as UserListLoader } from "~/routes/resource/dashboard";
import { useEffect, useState } from "react";
import { fetcherKeys } from "~/utils/fetcherKeys";
const formSchema = z.object({
  matchId: z.string(),
  User1: z.string().min(1).max(7),
  User2: z.string().min(1).max(7),
  User3: z.string().min(1).max(7),
  User4: z.string().min(1).max(7),
  User5: z.string().min(1).max(7),
});

type AddEditFormType = z.infer<typeof formSchema>;

export function AddMatchDetailsForm() {
  const [loading, setLoading] = useState(false);
  let fetcher = useFetcher({
    key: fetcherKeys.updateMatch,
  });
  const users = useLoaderData<typeof UserListLoader>();
  const form = useForm<AddEditFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matchId: "",
      User1: "",
      User2: "",
      User3: "",
      User4: "",
      User5: "",
    },
  });

  const matchId = form.watch("matchId");

  function onSubmit(values: AddEditFormType) {
    fetcher.submit(values, { method: "post" });
  }

  const userList = users?.users;

  useEffect(() => {
    if (!matchId) {
      return;
    }

    async function fetchUserScoresForMatch() {
      form.reset({
        matchId,
        User1: "",
        User2: "",
        User3: "",
        User4: "",
        User5: "",
      });
      try {
        setLoading(true);
        // await sleep(2000);
        const response = await fetch(`/played-matches/${matchId}`);
        const data = await response.json();
        for (const userScore of data.userScores) {
          const userId = userScore.userId;
          // TODO: fix this
          //@ts-expect-error - userId is a string
          form.setValue(`User${userId}`, userScore.score.toString());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserScoresForMatch();
  }, [matchId]);

  const isSubmitting = fetcher.state === "submitting";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormFieldSelect form={form} name="matchId" />
        <div className="mt-4 mb-4 border-t border-gray-200 border-dashed"></div>
        <SelectedMatchDetails />

        {userList?.map((user) => (
          <FormField
            key={user.id}
            control={form.control}
            name={`User${user.id}` as keyof AddEditFormType}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{user.displayName}</FormLabel>
                <FormControl>
                  <Input {...field} loading={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}

function SelectedMatchDetails() {
  const matchId = useWatch<AddEditFormType>({ name: "matchId" });
  const data = useFetcher<typeof MatchListLoader>({
    key: fetcherKeys.matchList,
  });

  const match = data?.data?.matches.find((match) => match.id === matchId);

  if (!matchId) {
    return null;
  }

  return (
    <div className="text-center flex flex-col gap-2">
      <div className="font-bold">Match Number: {match?.matchNumber}</div>
      <div className="text-md ">
        {match?.homeTeam.name} VS {match?.awayTeam.name}
      </div>
    </div>
  );
}
