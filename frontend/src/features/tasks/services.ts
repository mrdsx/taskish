import type { Task, TaskIn } from "@/features/tasks";
import { fetchApi } from "@/lib/api";
import {
  buildErrorResult,
  buildSuccessfulResult,
  type Result,
} from "@/lib/result";

// TODO: add validation

class TaskService {
  public async getAll(): Promise<Result<Task[]>> {
    const response = await fetchApi("/api/tasks");
    if (!response.ok) {
      return buildErrorResult("internal_error");
    }

    const data = (await response.json()) as Task[];

    return buildSuccessfulResult(data);
  }

  public async create(taskIn: TaskIn): Promise<Result<Task>> {
    const response = await fetchApi("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskIn),
    });
    if (!response.ok) {
      return buildErrorResult("internal_error");
    }

    const data = (await response.json()) as Task;

    return buildSuccessfulResult(data);
  }

  public async deleteById(taskId: Task["id"]): Promise<Result<null>> {
    const response = await fetchApi(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return buildErrorResult("internal_error");
    }

    return buildSuccessfulResult(null);
  }
}

export const taskService = new TaskService();
