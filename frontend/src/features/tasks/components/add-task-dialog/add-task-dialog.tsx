import { PlusIcon } from "lucide-solid";
import { createSignal } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddTaskForm } from "./add-task-form";

export const DIALOG_PADDING = 6;

export function AddTaskDialog() {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  return (
    <Dialog open={isOpen()} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogTrigger
        as={() => (
          <Button onClick={() => setIsOpen(true)}>
            <PlusIcon />
            Add task
          </Button>
        )}
      />
      <DialogContent class="px-0" showCloseButton>
        <DialogHeader class={`px-${DIALOG_PADDING}`}>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        <AddTaskForm setIsDialogOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}
