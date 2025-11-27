import { client } from "@/lib/auth-client/vanilla";
import { useEffect, useId, useState } from "react";
import RequestsTable from "./RequestsTable";
import { Button } from "./ui/button";
import AddUpcomingCompany from "./AddUpcomingCompany";

function AdminPanel({ authSession, initialPlacementRequests }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-medium">Placement Requests</h2>
        <div className="text-muted-foreground text-sm">
          List of all placement requests submitted by users
        </div>
      </div>

      <RequestsTable requests={initialPlacementRequests} admin />

      <div>
        <h2 className="text-lg font-medium">Upcoming Companies</h2>
        <div className="text-muted-foreground text-sm">
          List of all upcoming companies
        </div>
      </div>

      <AddUpcomingCompany>
        <Button variant="outline">Add a company</Button>
      </AddUpcomingCompany>
    </div>
  );
}

export default function AdminPage({
  initialAuthSession,
  initialPlacementRequests,
}) {
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
      <AdminPanel
        authSession={authSession}
        initialPlacementRequests={initialPlacementRequests}
      />
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
