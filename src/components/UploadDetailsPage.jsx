import { client } from "@/lib/auth-client/vanilla";
import { useEffect, useId, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { client as honoClient } from "@/lib/hono-client";
import { Button } from "./ui/button";
import { ChevronDownIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

export default function UploadDetailsPage({ initialAuthSession }) {
  const [authSession, setAuthSession] = useState(initialAuthSession);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoiningDateCalanderOpen, setIsJoiningDateCalanderOpen] =
    useState(false);
  const [joiningDate, setJoiningDate] = useState(undefined);
  const formRef = useRef();
  const formIdPrefix = useId();

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

  const onFormSubmit = (event) => {
    event.preventDefault();

    if (!formRef.current) return;

    const name = formRef.current.elements.name.value;
    const email = formRef.current.elements.email.value;
    const profile = formRef.current.elements.profile.files[0];
    const stream = formRef.current.elements.stream.value;
    const company = formRef.current.elements.company.value;
    const designation = formRef.current.elements.designation.value;
    const packageValue = Number(formRef.current.elements.package.value);
    const summary = formRef.current.elements.summary.value;

    setIsSubmitting(true);

    honoClient.api["placement-details"]
      .$post({
        form: {
          name,
          email,
          profile,
          stream,
          company,
          designation,
          package: packageValue,
          summary,
          joinedAt: joiningDate?.getTime(),
        },
      })
      .then(
        async (res) => {
          setIsSubmitting(false);

          const data = await res.json();
          if (res.ok && data.message) {
            formRef.current.reset();
            toast.success(data.message);
          } else if ("error" in data) {
            toast.error(data.error);
          }
        },
        () => {
          setIsSubmitting(false);
        }
      );
  };

  return authSession ? (
    <Card>
      <CardHeader>
        <CardTitle>Upload Placement Details</CardTitle>
        <CardDescription>
          Got a placement? Show your placements details by filling this form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" ref={formRef} onSubmit={onFormSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_name`}>Name</Label>
            <Input
              id={`${formIdPrefix}_name`}
              name="name"
              type="text"
              placeholder="John Doe"
              required
              defaultValue={authSession.user.name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_email`}>Email</Label>
            <Input
              id={`${formIdPrefix}_email`}
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              defaultValue={authSession.user.email}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_profile`}>Profile Image</Label>
            <Input
              id={`${formIdPrefix}_profile`}
              name="profile"
              type="file"
              accept="image/png, image/jpeg"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Stream</Label>
            <Select name="stream" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Streams</SelectLabel>
                  <SelectItem value="bca">BCA</SelectItem>
                  <SelectItem value="bsc">B.Sc</SelectItem>
                  <SelectItem value="msc">M.Sc</SelectItem>
                  <SelectItem value="bcom">B.Com</SelectItem>
                  <SelectItem value="mcom">M.Com</SelectItem>
                  <SelectItem value="bba">BBA</SelectItem>
                  <SelectItem value="bed">B.Ed</SelectItem>
                  <SelectItem value="ba">BA</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_joinedAt`}>Joining Date</Label>
            <Popover
              open={isJoiningDateCalanderOpen}
              onOpenChange={setIsJoiningDateCalanderOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id={`${formIdPrefix}_joinedAt`}
                  className="w-full justify-between font-normal"
                >
                  {joiningDate
                    ? joiningDate.toLocaleDateString()
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={joiningDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setJoiningDate(date);
                    setIsJoiningDateCalanderOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_company`}>Company</Label>
            <Input
              id={`${formIdPrefix}_company`}
              name="company"
              type="text"
              placeholder="Google"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_designation`}>Designation</Label>
            <Input
              id={`${formIdPrefix}_designation`}
              name="designation"
              type="text"
              placeholder="Junior Software Engineer"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_package`}>
              Package (Rs. per annum)
            </Label>
            <Input
              id={`${formIdPrefix}_package`}
              name="package"
              type="number"
              placeholder="1000000"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formIdPrefix}_summary`}>Summary</Label>
            <Textarea
              id={`${formIdPrefix}_summary`}
              name="summary"
              placeholder="Write details"
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <SendIcon /> Request for Approval
          </Button>
        </form>
      </CardContent>
    </Card>
  ) : (
    <div>
      <a className="underline" href="/login">
        Login
      </a>{" "}
      to upload your placement details.
    </div>
  );
}
