import { type ComponentProps, splitProps } from "solid-js";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

type SubmitButtonProps = ComponentProps<"button"> & {
  isLoading?: boolean;
};

export function SubmitButton(props: SubmitButtonProps) {
  const [, rest] = splitProps(props, ["class", "isLoading", "disabled"]);

  return (
    <Button
      class={props.class}
      type="submit"
      disabled={props.disabled || props.isLoading}
      {...rest}
    >
      <LoadingSwap isLoading={props.isLoading ?? false}>
        {rest.children}
      </LoadingSwap>
    </Button>
  );
}
