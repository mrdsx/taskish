import type { Task } from "@/features/tasks";

function trimAndLowerCase(string: string): string {
  return string.trim().toLowerCase();
}

export function getFilteredTasks<T extends Task>(
  tasks: T[],
  searchQuery: string,
): T[] {
  return tasks.filter((task) => {
    const queryInTitle = trimAndLowerCase(task.title).includes(
      trimAndLowerCase(searchQuery),
    );
    const queryInSubTasks = task.subTasks.some((subTask) =>
      trimAndLowerCase(subTask).includes(trimAndLowerCase(searchQuery)),
    );

    return queryInTitle || queryInSubTasks;
  });
}
