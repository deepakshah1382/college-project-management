import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  LogInIcon,
  LogOutIcon,
  ShieldUserIcon,
  UploadIcon,
  UserRoundIcon,
  UserRoundPlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { client } from "@/lib/auth-client/vanilla";
import { toast } from "sonner";

export default function LoginDropdown({ initialAuthSession }) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-9 text-black" variant="outline">
          <span className="sr-only">My Account</span>
          <UserRoundIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40 bg-blue-50" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        {authSession ? (
          <>
            <DropdownMenuItem asChild>
              <a href="/profile">
                <UserRoundIcon /> Profile
              </a>
            </DropdownMenuItem>
            {authSession.user.role === "admin" && (
              <DropdownMenuItem asChild>
                <a href="/admin">
                  <ShieldUserIcon /> Admin
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild onClick={logOut}>
              <button className="w-full">
                <LogOutIcon /> Logout
              </button>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <a href="/login">
                <LogInIcon /> Login
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/register">
                <UserRoundPlusIcon /> Register
              </a>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuLabel>Pages</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <a href="/upload-details">
            <UploadIcon /> Upload Details
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
