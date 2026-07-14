import { createSignal } from "solid-js";

export const [isDisplayingTrash, setIsDisplayingTrash] =
  createSignal<boolean>(false);
