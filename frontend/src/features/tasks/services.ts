import z from "zod";
import type { Task, TaskIn } from "@/features/tasks";
import { fetchApi } from "@/lib/api";
import {
  buildErrorResult,
  buildSuccessfulResult,
  getErrorCode,
  type Result,
} from "@/lib/result";
import {
  dailyTaskInSchema,
  dailyTaskSchema,
  deletedTaskSchema,
  exportedTasksSchema,
  taskInSchema,
  taskSchema,
} from "./schemas";
import type {
  DailyTask,
  DailyTaskIn,
  DeletedTask,
  ExportedTasks,
} from "./types";

class TaskService {
  public async getAll(): Promise<Result<Task[]>> {
    const response = await fetchApi("/tasks");
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = z.array(taskSchema).safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }

  public async create(taskIn: TaskIn): Promise<Result<Task>> {
    const inputParse = taskInSchema.safeParse(taskIn);
    if (!inputParse.success) {
      return buildErrorResult("client_validation_error");
    }

    const response = await fetchApi("/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputParse.data),
    });
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = taskSchema.safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }

  public async updateById(
    taskId: Task["id"],
    taskIn: TaskIn,
  ): Promise<Result<Task>> {
    const inputParse = taskInSchema.safeParse(taskIn);
    if (!inputParse.success) {
      return buildErrorResult("client_validation_error");
    }

    const response = await fetchApi(`/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputParse.data),
    });
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = taskSchema.safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }

  public async deleteById(taskId: Task["id"]): Promise<Result<null>> {
    const response = await fetchApi(`/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    return buildSuccessfulResult(null);
  }
}

class DailyTaskService {
  public async getAll(): Promise<Result<DailyTask[]>> {
    const response = await fetchApi("/daily-tasks");
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = z.array(dailyTaskSchema).safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }

  public async create(taskIn: DailyTaskIn): Promise<Result<DailyTask>> {
    const inputParse = dailyTaskInSchema.safeParse(taskIn);
    if (!inputParse.success) {
      return buildErrorResult("client_validation_error");
    }

    const response = await fetchApi("/daily-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskIn),
    });
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = dailyTaskSchema.safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }

  public async updateById(
    taskId: DailyTask["id"],
    taskIn: DailyTaskIn,
  ): Promise<Result<DailyTask>> {
    const inputParse = dailyTaskInSchema.safeParse(taskIn);
    if (!inputParse.success) {
      return buildErrorResult("client_validation_error");
    }

    const response = await fetchApi(`/daily-tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputParse.data),
    });
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = dailyTaskSchema.safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }

  public async deleteById(taskId: DailyTask["id"]): Promise<Result<null>> {
    const response = await fetchApi(`/daily-tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    return buildSuccessfulResult(null);
  }
}

class TrashService {
  public async getTrash(): Promise<Result<DeletedTask[]>> {
    const response = await fetchApi("/trash");
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = z.array(deletedTaskSchema).safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }

  public async restoreById(taskId: DeletedTask["id"]): Promise<Result<null>> {
    const response = await fetchApi(`/trash/${taskId}`, { method: "POST" });
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    return buildSuccessfulResult(null);
  }
}

class ExportService {
  public async exportTasksToJSON(): Promise<Result<ExportedTasks>> {
    const response = await fetchApi("/export/json");
    if (!response.ok) {
      return buildErrorResult(getErrorCode(response.status));
    }

    const data = await response.json();
    const responseParse = exportedTasksSchema.safeParse(data);
    if (!responseParse.success) {
      return buildErrorResult("response_validation_error");
    }

    return buildSuccessfulResult(responseParse.data);
  }
}

export const taskService = new TaskService();
export const dailyTaskService = new DailyTaskService();
export const trashService = new TrashService();
export const exportService = new ExportService();
