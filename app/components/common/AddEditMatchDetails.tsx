import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Form } from "react-router";
import { AddMatchDetailsForm } from "./AddMatchForm";

export function AddEditMatchDetails() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Add Match Details</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Match Details</DrawerTitle>
        </DrawerHeader>
        <Form method="post">
          <div className="p-4">
            <AddMatchDetailsForm />
          </div>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
