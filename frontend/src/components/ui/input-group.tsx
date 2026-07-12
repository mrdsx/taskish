import { TextField as TextFieldPrimitive } from "@kobalte/core/text-field";
import {
  type ComponentProps,
  type ParentProps,
  splitProps,
  type ValidComponent,
} from "solid-js";
import { cx } from "@/lib/utils";

export function InputGroup(props: ParentProps) {
  return (
    <div
      class={cx(
        "flex items-center h-9 rounded-md border border-input bg-transparent text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "has-[button:focus-visible]:ring-0",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
      )}
    >
      {props.children}
    </div>
  );
}

export type InputGroupInputProps<T extends ValidComponent = "input"> =
  ComponentProps<typeof TextFieldPrimitive.Input<T>>;

export function InputGroupInput(props: InputGroupInputProps) {
  const [, rest] = splitProps(props as InputGroupInputProps, ["class"]);

  return (
    <TextFieldPrimitive.Input
      data-slot="text-field"
      class={cx("focus-visible:outline-0 pl-2", props.class)}
      {...rest}
    />
  );
}
