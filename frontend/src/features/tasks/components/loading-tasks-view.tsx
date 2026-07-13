import { LoaderCircleIcon } from "lucide-solid";

export function LoadingTasksView() {
  return (
    <div class="flex items-center justify-center gap-2 py-5">
      <LoaderCircleIcon class="size-5 animate-spin" />
      <p>Loading tasks...</p>
    </div>
  );
}
