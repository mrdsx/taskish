import { Trash2Icon } from "lucide-solid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

type DeleteTaskAlertDialogProps = {
  description: string;
  isDeleting: boolean;
  deleteTask: () => void;
};

export function DeleteTaskAlertDialog(props: DeleteTaskAlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger as={Button} size="icon" variant="destructive">
        <LoadingSwap isLoading={props.isDeleting}>
          <Trash2Icon />
        </LoadingSwap>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>{props.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => props.deleteTask()}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
