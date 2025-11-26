import { client } from "@/lib/auth-client/vanilla";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { LogOutIcon, ShieldUserIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";

export default function LoggedInCard({ authSession }) {
  const logOut = () => {
    client.signOut().then(({ data, error }) => {
      if (error) {
        toast.error("Failed to log out");
      } else {
        toast.success("You are logged out");
      }
    });
  };

  return (
    <Card className="bg-blue-200">
      <CardHeader>
        <CardTitle className="text-shadow-blue-50">You are logged in</CardTitle>
        <CardDescription className="text-black">
          You are already logged in, logout to register
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        <div className="text-blue-950 ">{authSession.user.name}</div>
        <div className="text-sm opacity-80 text-black">
          {authSession.user.email}
        </div>
        {!authSession.user.emailVerified && (
          <div className="text-sm mt-4 text-black ">
            Your email is not verified, verify it from{" "}
            <a className="underline" href="/profile">
              Profile page
            </a>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild>
          <a href="/profile">
            <UserRoundIcon /> Profile
          </a>
        </Button>
        {authSession.user.role === "admin" && (
          <Button asChild>
            <a href="/admin">
              <ShieldUserIcon /> Admin
            </a>
          </Button>
        )}
        <Button type="button" onClick={logOut}>
          <LogOutIcon /> Logout
        </Button>
      </CardFooter>
    </Card>
  );
}
