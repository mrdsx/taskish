import type { VariantProps } from "cva";
import { type ComponentProps, splitProps } from "solid-js";
import { cva, cx } from "@/lib/utils";

const emptyVariants = cva({
  base: [
    "flex border-2 min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
  ],

  variants: {
    variant: {
      default: "border-primary",
      destructive: [
        "border-destructive ",
        "**:data-[slot=empty-header]:text-destructive **:data-[slot=empty-description]:text-destructive/80",
      ],
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type EmptyProps = ComponentProps<"div"> & VariantProps<typeof emptyVariants>;

export function Empty(props: EmptyProps) {
  const [, rest] = splitProps(props, ["class", "variant"]);

  return (
    <div
      data-slot="empty"
      class={emptyVariants({
        variant: props.variant,
        class: props.class,
      })}
      {...rest}
    />
  );
}

type EmptyHeaderProps = ComponentProps<"div">;

export function EmptyHeader(props: EmptyHeaderProps) {
  const [, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="empty-header"
      class={cx(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        props.class,
      )}
      {...rest}
    />
  );
}

const emptyMediaVariants = cva({
  base: [
    "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],

  variants: {
    variant: {
      default: "bg-transparent",
      icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type EmptyMediaProps = ComponentProps<"div"> &
  VariantProps<typeof emptyMediaVariants>;

export function EmptyMedia(props: EmptyMediaProps) {
  const [, rest] = splitProps(props, ["class", "variant"]);

  return (
    <div
      data-slot="empty-icon"
      data-variant={props.variant}
      class={emptyMediaVariants({
        variant: props.variant,
        class: props.class,
      })}
      {...rest}
    />
  );
}

type EmptyTitleProps = ComponentProps<"div">;

export function EmptyTitle(props: EmptyTitleProps) {
  const [, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="empty-title"
      class={cx("font-medium text-lg tracking-tight", props.class)}
      {...rest}
    />
  );
}

type EmptyDescriptionProps = ComponentProps<"p">;

export function EmptyDescription(props: EmptyDescriptionProps) {
  const [, rest] = splitProps(props, ["class"]);

  return (
    <div
      data-slot="empty-description"
      class={cx(
        "text-muted-foreground text-sm/relaxed [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        props.class,
      )}
      {...rest}
    />
  );
}

type EmptyContentProps = ComponentProps<"div">;

export function EmptyContent(props: EmptyContentProps) {
  const [, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="empty-content"
      class={cx(
        "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
        props.class,
      )}
      {...rest}
    />
  );
}
