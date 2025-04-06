import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { AddMatchDetailsForm } from "./AddMatchForm";
import { useState, useEffect } from "react";
import { useActionData } from "react-router";
import type { action } from "~/routes/dashboard";

export function AddEditMatchDetails() {
  const [open, setOpen] = useState(false);
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData?.updateStatus === "Success") {
      setOpen(false);
    }
  }, [actionData]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="cursor-pointer">Update Match Details</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center font-bold">
            Update Match Details
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4">
          <AddMatchDetailsForm />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
