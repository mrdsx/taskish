import { MoonIcon, SunIcon } from "lucide-solid";
import { Show } from "solid-js";
import { useThemeStore } from "@/stores/theme";
import { Button } from "./ui/button";

export function ToggleThemeButton() {
  const theme = useThemeStore();

  function handleClick() {
    theme().setIsDarkMode(!theme().isDarkMode);
  }

  return (
    <Button variant="outline" onClick={handleClick}>
      <Show when={theme().isDarkMode}>
        <SunIcon />
      </Show>
      <Show when={!theme().isDarkMode}>
        <MoonIcon />
      </Show>
    </Button>
  );
}
