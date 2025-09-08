import { client } from "@/lib/auth-client/vanilla";
import { useEffect, useState } from "react";

function AdminPortal({ authSession }) {
  return <>{authSession.user.name}</>;
}

export default function AdminPage({ initialAuthSession }) {
  const [authSession, setAuthSession] = useState(initialAuthSession);

  useEffect(() => {
    const unsubscribe = client.useSession.subscribe(({ data, isPending }) => {
      if (!isPending) {
        setAuthSession(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return authSession ? (
    authSession.user.role === "admin" ? (
      <AdminPortal authSession={authSession} />
    ) : (
      <div>You are not an admin </div>
    )
  ) : (
    <div>
      You are currently not logged in. Please{" "}
      <a className="underline" href="/login">
        login
      </a>{" "}
      with an admin account to access this page.
    </div>
  );
}
