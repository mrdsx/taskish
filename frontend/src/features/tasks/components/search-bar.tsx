import { XIcon } from "lucide-solid";
import { type ComponentProps, Show } from "solid-js";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cx } from "@/lib/utils";
import { searchQuery, setSearchQuery } from "../stores/search";

type SearchBarProps = Pick<
  ComponentProps<typeof InputGroup>,
  "class" | "disabled"
>;

export function SearchBar(props: SearchBarProps) {
  return (
    <InputGroup class={cx("shrink-0", props.class)}>
      <InputGroupInput
        placeholder="Type your search query..."
        value={searchQuery()}
        disabled={props.disabled}
        onInput={(event) => {
          setSearchQuery(event.currentTarget.value);
        }}
      />
      <Show when={searchQuery()?.length > 0}>
        <InputGroupButton onClick={() => setSearchQuery("")}>
          <XIcon />
        </InputGroupButton>
      </Show>
    </InputGroup>
  );
}
