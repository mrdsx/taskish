import z from "zod";
import type { Task, TaskIn } from "@/features/tasks";
import { fetchApi } from "@/lib/api";
import {
  buildErrorResult,
  buildSuccessfulResult,
  type Result,
} from "@/lib/result";
import { deletedTaskSchema, taskInSchema, taskSchema } from "./schemas";
import type { DeletedTask } from "./types";

class TaskService {
  public async getAll(): Promise<Result<Task[]>> {
    const response = await fetchApi("/tasks");
    if (!response.ok) {
      return buildErrorResult("internal_error");
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
      return buildErrorResult("internal_error");
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
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputParse.data),
    });
    if (!response.ok) {
      return buildErrorResult("internal_error");
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
      return buildErrorResult("internal_error");
    }

    return buildSuccessfulResult(null);
  }
}

class TrashService {
  public async getTrash(): Promise<Result<DeletedTask[]>> {
    const response = await fetchApi("/trash");
    if (!response.ok) {
      return buildErrorResult("internal_error");
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
      return buildErrorResult("internal_error");
    }

    return buildSuccessfulResult(null);
  }
}

export const taskService = new TaskService();
export const trashService = new TrashService();
