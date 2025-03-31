import { useForm } from "react-hook-form";
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

const formSchema = z.object({
  matchId: z.string().min(1).max(4),
  User1: z.string().min(1).max(4),
  User2: z.string().min(1).max(4),
  User3: z.string().min(1).max(4),
  User4: z.string().min(1).max(4),
  User5: z.string().min(1).max(4),
});

export function AddMatchDetailsForm() {
  const form = useForm<z.infer<typeof formSchema>>({
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

  return (
    <Form {...form}>
      <FormFieldSelect form={form} name="matchId" />
      <div className="mt-8 mb-8 border-t border-gray-200 border-dashed"></div>
      <FormField
        control={form.control}
        name="User1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User 1 Score</FormLabel>
            <FormControl>
              <Input placeholder="100" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="User2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User 2 Score</FormLabel>
            <FormControl>
              <Input placeholder="100" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="User3"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User 3 Score</FormLabel>
            <FormControl>
              <Input placeholder="100" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="User4"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User 4 Score</FormLabel>
            <FormControl>
              <Input placeholder="100" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="User5"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User 5 Score</FormLabel>
            <FormControl>
              <Input placeholder="100" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </Form>
  );
}
