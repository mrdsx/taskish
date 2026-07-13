import { XIcon } from "lucide-solid";
import { Show } from "solid-js";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { searchQuery, setSearchQuery } from "../stores/search";

export function SearchBar() {
  return (
    <InputGroup>
      <InputGroupInput
        placeholder="Type your search query..."
        value={searchQuery()}
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
