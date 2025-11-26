import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { useId, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";
import { client } from "@/lib/hono-client";

export default function ContactForm({ intialAuthSession }) {
  const formIdPrefix = useId();
  const formRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFormSubmit = (event) => {
    event.preventDefault();

    if (!formRef.current) return;

    const name = formRef.current.elements.name.value;
    const email = formRef.current.elements.email.value;
    const message = formRef.current.elements.message.value;

    setIsSubmitting(true);

    // fetch("/api/contact", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     name,
    //     email,
    //     message,
    //   }),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    //   .then(async (res) => {
    //     const data = await res.json();

    //     if (res.status === 200) {
    //     } else if ("error" in data) {
    //       toast.error(data.message);
    //     }

    //     console.log(data);
    //   })
    //   .finally(() => {
    //     setIsSubmitting(false);
    //   });

    client.api.contact
      .$post({
        json: {
          name,
          email,
          message,
        },
      })
      .then(async (res) => {
        const data = await res.json();

        if (res.ok && data.success) {
          formRef.current.reset();
          toast.success(data.message);
        } else if ("error" in data) {
          toast.error(data.error);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact us</CardTitle>
        <CardDescription>
          Fill this form to contact us. We shall reply you soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={onFormSubmit} ref={formRef}>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_name`}>Name</Label>
            <Input
              id={`${formIdPrefix}_name`}
              name="name"
              type="text"
              placeholder="John Doe"
              defaultValue={
                intialAuthSession ? intialAuthSession.user.name : undefined
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_email`}>Email</Label>
            <Input
              id={`${formIdPrefix}_email`}
              name="email"
              type="email"
              placeholder="john@example.com"
              defaultValue={
                intialAuthSession ? intialAuthSession.user.email : undefined
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_message`}>Message</Label>
            <Textarea
              id={`${formIdPrefix}_message`}
              name="message"
              placeholder="Hello!"
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <SendIcon /> Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
