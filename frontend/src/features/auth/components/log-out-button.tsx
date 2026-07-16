import { createMutation } from "@tanstack/solid-query";
import { toast } from "somoto";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { getErrorMessage } from "@/lib/result";
import { useUserStore } from "@/stores/user";
import { authService } from "../services";

export function LogOutButton() {
  const setIsAuthenticated = useUserStore((state) => state.setIsAuthenticated);
  const logOutMutation = createMutation(() => ({
    mutationFn: async () => {
      const result = await authService.logOut();
      if (!result.success) {
        toast.error(getErrorMessage(result.errorCode));
        throw new Error("Failed to log out");
      }
    },
    onSuccess: () => {
      setIsAuthenticated(false);
    },
  }));

  function handleLogOut() {
    logOutMutation.mutate();
  }

  return (
    <Button
      variant="outline"
      disabled={logOutMutation.isPending}
      onClick={handleLogOut}
    >
      <LoadingSwap isLoading={logOutMutation.isPending}>Log out</LoadingSwap>
    </Button>
  );
}
