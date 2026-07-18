import type { AuthSession } from "../types";

export function AuthSessionItemView(props: { authSession: AuthSession }) {
  const authSession = props.authSession;

  return (
    <div class="bg-neutral-100 dark:bg-card rounded-lg p-2 border">
      <p>
        {authSession.host} - {authSession.location}
      </p>
      <p class="text-sm text-muted-foreground">
        Last request: {new Date(authSession.lastLogin).toLocaleString()} (
        {authSession.expiresAt})
      </p>
      <img class="mt-2 rounded" src={authSession.flagUrl} alt="" width={55} />
    </div>
  );
}
