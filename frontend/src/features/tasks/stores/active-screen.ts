import { createSignal } from "solid-js";

type Screen = "tasks" | "dailyTasks" | "trash";

export const [activeScreen, setActiveScreen] = createSignal<Screen>("tasks");
