import type { AuthSession } from "../types";

export function AuthSessionItemView(props: { authSession: AuthSession }) {
  const authSession = props.authSession;

  return (
    <div class="rounded-lg border bg-neutral-100 p-2 dark:bg-card">
      <p>
        {authSession.host} - {authSession.location}
      </p>
      <p class="text-muted-foreground text-sm">
        Last request: {new Date(authSession.lastLogin).toLocaleString()} (
        {authSession.expiresAt})
      </p>
      <img class="mt-2 rounded" src={authSession.flagUrl} alt="" width={55} />
    </div>
  );
}
