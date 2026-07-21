import { TrashIcon } from "lucide-solid";
import { Button } from "@/components/ui/button";
import { setActiveScreen } from "../../stores/active-screen";

export function TrashButton() {
  return (
    <Button variant="outline" onClick={() => setActiveScreen("trash")}>
      <TrashIcon />
      Trash
    </Button>
  );
}
