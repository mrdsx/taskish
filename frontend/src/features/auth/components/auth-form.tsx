import { createMutation } from "@tanstack/solid-query";
import { EyeIcon, EyeOffIcon } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import { toast } from "somoto";
import { FormErrorView } from "@/components/form-error-view";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TextField, TextFieldLabel } from "@/components/ui/text-field";
import { getErrorMessage } from "@/lib/result";
import { useUserStore } from "@/stores/user";
import { authService } from "../services";

export function AuthForm() {
  const [isPasswordVisible, setIsPasswordVisible] =
    createSignal<boolean>(false);
  const [password, setPassword] = createSignal<string>("");
  const [formError, setFormError] = createSignal<string | null>(null);
  const setIsAuthenticated = useUserStore((state) => state.setIsAuthenticated);

  const authMutation = createMutation(() => ({
    mutationFn: async () => {
      const result = await authService.logIn(password());
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to authenticate");
      }
    },
    onSuccess: () => {
      setIsAuthenticated(true);
    },
  }));

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setFormError(null);

    if (password().trim().length === 0) {
      setFormError("Password field is empty");
      return;
    }

    authMutation.mutate();
  }

  return (
    <Card class="h-fit w-80">
      <CardHeader>
        <CardTitle>Login form</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" onSubmit={handleSubmit}>
          <TextField>
            <TextFieldLabel>Password</TextFieldLabel>
            <InputGroup>
              <InputGroupInput
                type={isPasswordVisible() ? "text" : "password"}
                placeholder="Secret token"
                value={password()}
                onInput={(event) => {
                  setPassword(event.currentTarget.value);
                }}
              />
              <InputGroupButton
                onClick={() => setIsPasswordVisible(!isPasswordVisible())}
              >
                <Show when={isPasswordVisible()}>
                  <EyeOffIcon />
                </Show>
                <Show when={!isPasswordVisible()}>
                  <EyeIcon />
                </Show>
              </InputGroupButton>
            </InputGroup>
          </TextField>
          <SubmitButton class="w-full" isLoading={authMutation.isPending}>
            Log in
          </SubmitButton>
        </form>
        <FormErrorView class="mt-4" formError={formError()} />
      </CardContent>
    </Card>
  );
}
