import { useUserStore } from "@/stores/user";
import { Button } from "./ui/button";

export function LogOutButton() {
  const resetUserStore = useUserStore((state) => state.reset);

  return (
    <Button variant="outline" onClick={() => resetUserStore()}>
      Log Out
    </Button>
  );
}
