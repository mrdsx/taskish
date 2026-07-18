import type { AuthSession } from "../types";

export function AuthSessionItemView(props: {
  authSession: AuthSession;
  index: number;
}) {
  const authSession = props.authSession;

  return (
    <>
      <p>
        <span class="font-semibold">{props.index + 1}.</span> {authSession.host}{" "}
        - {authSession.location}
      </p>
      <p class="text-sm text-muted-foreground">
        Last request: {new Date(authSession.lastLogin).toLocaleString()} (
        {authSession.expiresAt})
      </p>
      <img class="mt-2" src={authSession.flagUrl} alt="" width={50} />
    </>
  );
}
