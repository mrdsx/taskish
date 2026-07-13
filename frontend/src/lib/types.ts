export type TaskIn = Omit<Task, "id">;

export type Task = {
  id: number;
  title: string;
  subTasks: string[];
};
