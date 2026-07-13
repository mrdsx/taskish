import { Button } from "./ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./ui/empty";

export function EmptyErrorView(props: { retry: () => void }) {
  return (
    <Empty variant="destructive">
      <EmptyHeader>
        <EmptyTitle>Something went wrong!</EmptyTitle>
        <EmptyDescription>
          Something isn't working as expected.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="destructive" onClick={() => props.retry()}>
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
}
