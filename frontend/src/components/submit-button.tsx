import { type ComponentProps, splitProps } from "solid-js";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

type SubmitButtonProps = Omit<ComponentProps<"button">, "disabled"> & {
  isLoading?: boolean;
};

export function SubmitButton(props: SubmitButtonProps) {
  const [, rest] = splitProps(props, ["class", "isLoading"]);

  return (
    <Button
      class={props.class}
      type="submit"
      disabled={props.isLoading}
      {...rest}
    >
      <LoadingSwap isLoading={props.isLoading ?? false}>
        {rest.children}
      </LoadingSwap>
    </Button>
  );
}
