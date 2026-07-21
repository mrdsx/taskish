import { Spinner } from "@/components/ui/spinner";

export function LoadingTasksView() {
  return (
    <div class="flex items-center justify-center gap-2 py-5">
      <Spinner class="size-5" />
      <p>Loading tasks...</p>
    </div>
  );
}
