import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { Trash2Icon } from "lucide-solid";
import type { Task } from "@/lib/types";
import { useUserStore } from "@/stores/user";
import { Button } from "./ui/button";
import { LoadingSwap } from "./ui/loading-swap";

export function DeleteTaskButton(props: { taskId: number }) {
	const user = useUserStore();
	const queryClient = useQueryClient();
	const deleteTaskMutation = useMutation(() => ({
		mutationFn: async () => {
			// TODO: extract to repository
			await fetch(`${user().apiUrl}/api/tasks/${props.taskId}`, {
				method: "DELETE",
				headers: { "auth-token": user().authToken },
			});
		},
		onSuccess: () => {
			const tasks = queryClient.getQueryData(["tasks"]) as Task[];
			const newTasks = tasks.filter((task) => task.id !== props.taskId);
			queryClient.setQueryData(["tasks"], newTasks);
		},
	}));

	function handleClick() {
		deleteTaskMutation.mutate();
	}

	return (
		<Button
			size="icon"
			variant="destructive"
			disabled={deleteTaskMutation.isPending}
			onClick={handleClick}
		>
			<LoadingSwap isLoading={deleteTaskMutation.isPending}>
				<Trash2Icon />
			</LoadingSwap>
		</Button>
	);
}
