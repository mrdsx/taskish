import { createSignal } from "solid-js";

export const [searchQuery, setSearchQuery] = createSignal<string>("");
