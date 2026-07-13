import { defineConfig } from "cva";
import { twMerge } from "tailwind-merge";

export const { cva, cx } = defineConfig({
  hooks: {
    onComplete: (className) => twMerge(className),
  },
});

/* Suitable only for arrays with primitive values */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}
