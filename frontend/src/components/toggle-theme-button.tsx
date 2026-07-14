import { useColorMode } from "@kobalte/core";
import { MoonIcon, SunIcon } from "lucide-solid";
import { Show } from "solid-js";
import { Button } from "./ui/button";

export function ToggleThemeButton() {
  const { colorMode, toggleColorMode } = useColorMode();

  function handleClick() {
    toggleColorMode();
  }

  return (
    <Button variant="outline" onClick={handleClick}>
      <Show when={colorMode() === "dark"}>
        <SunIcon />
      </Show>
      <Show when={colorMode() === "light"}>
        <MoonIcon />
      </Show>
    </Button>
  );
}
