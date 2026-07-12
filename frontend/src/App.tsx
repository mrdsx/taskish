import { Match, onMount, Switch } from "solid-js";
import { AuthForm } from "./components/AuthForm";
import { TasksScreen } from "./components/TasksScreen";
import { useUserStore } from "./stores/user";

export function App() {
	const user = useUserStore();

	onMount(async () => {
		// TODO: extract to repository
		const response = await fetch(user().apiUrl, {
			headers: { "auth-token": user().authToken },
		});
		if (!response.ok) {
			user().reset();
		}
	});

	return (
		<Switch>
			<Match when={user().isAuthenticated}>
				<TasksScreen />
			</Match>
			<Match when={!user().isAuthenticated}>
				<main class="flex min-h-screen justify-center pt-[20vh]">
					<AuthForm />
				</main>
			</Match>
		</Switch>
	);
}
