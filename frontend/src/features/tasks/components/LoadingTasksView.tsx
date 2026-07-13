import { LoaderCircleIcon } from "lucide-solid";

export function LoadingTasksView() {
  return (
    <div class="flex justify-center items-center gap-2 py-5">
      <LoaderCircleIcon class="animate-spin size-5" />
      <p>Loading tasks...</p>
    </div>
  );
}
