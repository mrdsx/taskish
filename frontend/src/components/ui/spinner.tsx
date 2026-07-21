import { LoaderCircleIcon } from "lucide-solid";
import { type ComponentProps, splitProps } from "solid-js";
import { cx } from "@/lib/utils";

export function Spinner(props: ComponentProps<"svg">) {
  const [, rest] = splitProps(props, ["class"]);

  return <LoaderCircleIcon class={cx("animate-spin", props.class)} {...rest} />;
}
