import { useEffect, useId, useRef, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { client } from "@/lib/auth-client/vanilla";
import { toast } from "sonner";
import { LogInIcon } from "lucide-react";
import LoggedInCard from "./LoggedInCard";

export default function LoginForm({ initialAuthSession }) {
  const [authSession, setAuthSession] = useState(initialAuthSession);
  const [isLoggingIn, setIsLogginIn] = useState(false);

  const formIdPrefix = useId();
  const formRef = useRef();

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

  const onLoginFormSubmit = (event) => {
    event.preventDefault();

    if (!formRef.current) {
      return;
    }

    const email = formRef.current.elements.email.value;
    const password = formRef.current.elements.password.value;

    setIsLogginIn(true);

    client.signIn
      .email({
        email,
        password,
      })
      .then(({ error }) => {
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("You are successfully logged in");
        }
      })
      .finally(() => {
        setIsLogginIn(false);
      });
  };

  return authSession ? (
    <LoggedInCard authSession={authSession} />
  ) : (
    <Card className="bg-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-950">Login to your account</CardTitle>
        <CardDescription className="text-black">
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button
            variant="secondary"
            className="bg-blue-950 text-white hover:bg-blue-700"
            asChild
          >
            <a href="/register">Register</a>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          className="flex flex-col gap-6"
          onSubmit={onLoginFormSubmit}
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor={`${formIdPrefix}_email`}>Email</Label>
              <Input
                className="bg-background"
                id={`${formIdPrefix}_email`}
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor={`${formIdPrefix}_password`}>Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                className="bg-background"
                id={`${formIdPrefix}_password`}
                type="password"
                name="password"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            <LogInIcon /> Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
