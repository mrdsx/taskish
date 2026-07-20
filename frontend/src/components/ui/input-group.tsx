import { TextField as TextFieldPrimitive } from "@kobalte/core/text-field";
import { type ComponentProps, splitProps, type ValidComponent } from "solid-js";
import { cx } from "@/lib/utils";
import { Button } from "./button";

type InputGroupProps<T extends ValidComponent = "div"> = ComponentProps<
  typeof TextFieldPrimitive<T>
>;

export function InputGroup(props: InputGroupProps) {
  const [, rest] = splitProps(props, ["class"]);

  return (
    <TextFieldPrimitive
      class={cx(
        "flex h-9 items-center overflow-hidden rounded-md border border-input bg-transparent text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
        "has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-[button:focus-visible]:ring-0",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
        props.class,
      )}
      {...rest}
    />
  );
}

export type InputGroupInputProps<T extends ValidComponent = "input"> =
  ComponentProps<typeof TextFieldPrimitive.Input<T>>;

export function InputGroupInput(props: InputGroupInputProps) {
  const [, rest] = splitProps(props as InputGroupInputProps, ["class"]);

  return (
    <TextFieldPrimitive.Input
      data-slot="input-group-input"
      class={cx("w-full px-2 focus-visible:outline-0", props.class)}
      {...rest}
    />
  );
}

export type InputGroupButtonProps = ComponentProps<"button">;

export function InputGroupButton(props: InputGroupButtonProps) {
  return (
    <Button
      data-slot="input-group-button"
      size="icon"
      variant="ghost"
      {...props}
    >
      {props.children}
    </Button>
  );
}
