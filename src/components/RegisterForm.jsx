import { useEffect, useId, useRef, useState } from "react";
import { UserRoundPlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { client } from "@/lib/auth-client/vanilla";
import { toast } from "sonner";
import LoggedInCard from "./LoggedInCard";

export default function RegisterForm({ initialAuthSession }) {
  const [authSession, setAuthSession] = useState(initialAuthSession);
  const [isRegistering, setIsRegistering] = useState(false);
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

  const onRegisterFormSubmit = (event) => {
    event.preventDefault();

    if (!formRef.current) {
      return;
    }

    const name = formRef.current.elements.name.value;
    const email = formRef.current.elements.email.value;
    const password = formRef.current.elements.password.value;

    setIsRegistering(true);

    client.signUp
      .email({
        name,
        email,
        password,
      })
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created!");
        }
      })
      .finally(() => {
        setIsRegistering(false);
      });
  };

  return authSession ? (
    <LoggedInCard authSession={authSession} />
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Register for an account</CardTitle>
        <CardDescription>Create an account using your email</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          ref={formRef}
          onSubmit={onRegisterFormSubmit}
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor={`${formIdPrefix}_name`}>Name</Label>
              <Input
                id={`${formIdPrefix}_name`}
                type="text"
                name="name"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formIdPrefix}_email`}>Email</Label>
              <Input
                id={`${formIdPrefix}_email`}
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formIdPrefix}_password`}>Password</Label>
              <Input
                id={`${formIdPrefix}_password`}
                type="password"
                name="password"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isRegistering}>
            <UserRoundPlusIcon /> Register
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
