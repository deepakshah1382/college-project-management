import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BriefcaseIcon,
  BuildingIcon,
  CalendarPlusIcon,
  HandCoinsIcon,
  MailIcon,
  UniversityIcon,
} from "lucide-react";
import FormattedDate from "./FormattedDate";

export default function PlacedStudents({ placedStudents }) {
  return (
    <div className="grid gap-7">
      {placedStudents.map((placed) => (
        <div
          className="flex flex-col items-center gap-4 md:flex-row md:items-start"
          key={placed.id}
        >
          <Avatar className="size-40 rounded-md border shadow-sm">
            <AvatarImage
              className="rounded-md object-cover object-center"
              src={`/api/placed-students/${placed.id}/profile`}
              alt={placed.name}
              loading="lazy"
            />
            <AvatarFallback className="rounded-md">
              {placed.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-4 justify-center bg-blue-100 border h-full p-4 rounded-md shadow-sm">
            <div className="text-2xl font-medium">{placed.name}</div>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    title: "Email",
                    icon: MailIcon,
                    value: placed.email,
                  },
                  {
                    title: "Stream",
                    icon: UniversityIcon,
                    value: placed.stream.toUpperCase(),
                  },
                  {
                    title: "Company",
                    icon: BuildingIcon,
                    value: placed.company,
                  },
                  {
                    title: "Designation",
                    icon: BriefcaseIcon,
                    value: placed.designation,
                  },
                  {
                    title: "Package",
                    icon: HandCoinsIcon,
                    value: `Rs. ${placed.package} LPA`,
                  },
                  {
                    title: "Joining date",
                    icon: CalendarPlusIcon,
                    value: (
                      <FormattedDate date={placed.joinedAt} format="date" />
                    ),
                  },
                ].map(({ title, icon: Icon, value }) => (
                  <div
                    key={title}
                    className="flex flex-col bg-blue-950 p-2.5 border rounded-md text-white"
                  >
                    <div className="text-sm opacity-90 flex gap-2 items-center">
                      <Icon className="shrink-0" size={14} />
                      <span>{title}</span>
                    </div>
                    <div className="break-words">{value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="text-sm opacity-90">Summary</div>
                <div className="break-all">{placed.summary}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
