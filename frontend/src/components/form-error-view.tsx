import { Show } from "solid-js";
import { cx } from "@/lib/utils";

type FormErrorViewProps = {
  formError: string | null;
  class: string;
};

export function FormErrorView(props: FormErrorViewProps) {
  return (
    <Show when={props.formError !== null}>
      <p class={cx("text-red-500", props.class)}>{props.formError}</p>
    </Show>
  );
}
