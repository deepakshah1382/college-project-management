import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useId, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { client as honoClient } from "@/lib/hono-client";
import { toast } from "sonner";

export default function AddUpcomingCompany({ children }) {
  const [isDateCalanderOpen, setIsDateCalanderOpen] = useState(false);
  const [date, setDate] = useState(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef();
  const formIdPrefix = useId();

  const onFormSubmit = (event) => {
    event.preventDefault();

    if (!formRef.current) return;

    const name = formRef.current.elements.name.value;
    const location = formRef.current.elements.location.value;
    const salary = [
      Number(formRef.current.elements.starting_salary.value),
      Number(formRef.current.elements.ending_salary.value),
    ];
    const requirements = formRef.current.elements.requirements.value;

    setIsSubmitting(true);

    honoClient.api["upcoming-companies"]
      .$post({
        json: {
          name,
          date: date?.getTime(),
          location,
          requirements,
          salary,
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

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Upcoming Comapny</DialogTitle>
          <DialogDescription>Add a new upcoming company</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          ref={formRef}
          onSubmit={onFormSubmit}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`${formIdPrefix}_name`}>Company name</Label>
              <Input
                id={`${formIdPrefix}_name`}
                name="name"
                placeholder="Google"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formIdPrefix}_date`}>Interview Date</Label>
              <Popover
                open={isDateCalanderOpen}
                onOpenChange={setIsDateCalanderOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id={`${formIdPrefix}_joinedAt`}
                    className="w-full justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDate(date);
                      setIsDateCalanderOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formIdPrefix}_location`}>Location</Label>
              <Input
                id={`${formIdPrefix}_location`}
                name="location"
                placeholder="Vapi"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formIdPrefix}_starting_salary`}>
                Salary Range (LPA)
              </Label>
              <div className="flex gap-2">
                <Input
                  className="grow"
                  type="number"
                  id={`${formIdPrefix}_starting_salary`}
                  name="starting_salary"
                  placeholder="80000"
                />
                <Input
                  className="grow"
                  type="number"
                  id={`${formIdPrefix}_ending_salary`}
                  name="ending_salary"
                  placeholder="90000"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formIdPrefix}_requirements`}>
                Requirements
              </Label>
              <Textarea
                id={`${formIdPrefix}_requirements`}
                name="requirements"
                placeholder="PHP"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
