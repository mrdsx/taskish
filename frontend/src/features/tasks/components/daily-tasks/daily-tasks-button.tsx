import { useColorMode } from "@kobalte/core";
import { StarIcon } from "lucide-solid";
import { Button } from "@/components/ui/button";
import { setActiveScreen } from "../../stores/active-screen";

export function DailyTasksButton() {
  const { colorMode } = useColorMode();

  return (
    <Button variant="outline" onClick={() => setActiveScreen("dailyTasks")}>
      <StarIcon fill={colorMode() === "dark" ? "white" : "black"} />
      Daily tasks
    </Button>
  );
}
