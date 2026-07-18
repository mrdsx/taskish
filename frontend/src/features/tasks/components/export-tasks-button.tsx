import { createMutation } from "@tanstack/solid-query";
import { FileUpIcon } from "lucide-solid";
import { toast } from "somoto";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { getErrorMessage } from "@/lib/result";
import { downloadJSON } from "@/lib/utils";
import { exportService } from "../services";

const JSON_FILENAME = "tasks.json";

export function ExportTasksButton() {
  const exportMutation = createMutation(() => ({
    mutationFn: async () => {
      const result = await exportService.exportTasksToJSON();
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to export the tasks");
      }

      return result.data;
    },
    onSuccess: (exportedTasks) => {
      downloadJSON(JSON_FILENAME, exportedTasks);
    },
  }));

  function handleClick() {
    exportMutation.mutate();
  }

  return (
    <Button
      class="w-25"
      variant="outline"
      disabled={exportMutation.isPending}
      onClick={handleClick}
    >
      <LoadingSwap isLoading={exportMutation.isPending}>
        <FileUpIcon /> Export
      </LoadingSwap>
    </Button>
  );
}
