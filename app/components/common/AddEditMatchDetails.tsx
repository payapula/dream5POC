import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { AddMatchDetailsForm } from "./AddMatchForm";

export function AddEditMatchDetails() {
  return (
    <Drawer>
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
