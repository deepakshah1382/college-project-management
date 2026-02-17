import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  ArrowUpDownIcon,
  CheckCheckIcon,
  MoreHorizontalIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { client as honoClient } from "@/lib/hono-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
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
import FormattedDate from "./FormattedDate";

export default function RequestsTable({
  requests: initialPlacementRequests,
  admin = false,
}) {
  const [requests, setRequests] = useState(initialPlacementRequests);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  async function patchRequestStatus(requestId, status) {
    setIsStatusUpdating(true);

    try {
      const response = await honoClient.api["placement-details"][":id"].$patch({
        param: {
          id: requestId,
        },
        json: {
          status,
        },
      });

      const { success } = await response.json();

      if (success) {
        setRequests((requests) =>
          requests.map((item) =>
            item.id === requestId ? { ...item, status } : item
          )
        );
      }
    } finally {
      setIsStatusUpdating(false);
    }
  }

  /** @type {import("@tanstack/react-table").ColumnDef<{ name: string }>[]} */
  const columns = [
    {
      header: "Profile",
      cell({ row }) {
        const { original: request } = row;
        return (
          <Avatar className="size-15 rounded-md border">
            <AvatarImage
              className="rounded-md object-cover object-center"
              src={`/api/placement-details/${request.id}/profile`}
            ></AvatarImage>
            <AvatarFallback className="text-xl rounded-md">
              {request.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      header: "Stream",
      accessorFn(request) {
        return request.stream.toUpperCase();
      },
    },
    {
      header: "Company",
      accessorKey: "company",
    },
    {
      header: "Designation",
      accessorKey: "designation",
    },
    {
      header: "Package (LPA)",
      accessorFn(request) {
        const { package: packageLpa } = request;
        return `₹${packageLpa}`;
      },
    },
    {
      header: "Joining date",
      cell({ row }) {
        const { original: request } = row;

        return <FormattedDate date={request.joinedAt} format="date" />;
      },
    },
    {
      header: "Created at",
      cell({ row }) {
        const { original: request } = row;

        return <FormattedDate date={request.createdAt} />;
      },
    },
    {
      header: "Status",
      cell({ row }) {
        const { original: request } = row;

        return (
          <Badge
            variant="secondary"
            className={cn(
              request.status === "approved"
                ? "bg-green-500 text-white"
                : request.status === "declined"
                ? "bg-red-500 text-white"
                : false
            )}
          >
            {request.status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const { original: request } = row;

        return (
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {admin &&
                  [
                    {
                      status: "approved",
                      text: "Approve",
                      icon: CheckCheckIcon,
                      variant: "default",
                    },
                    {
                      status: "declined",
                      text: "Decline",
                      icon: XIcon,
                      variant: "destructive",
                    },
                    {
                      status: "pending",
                      text: "Revert",
                      icon: Undo2Icon,
                      variant: "outline",
                    },
                  ]
                    .filter(({ status }) => status !== request.status)
                    .map(({ status, text, variant, icon: Icon }) => (
                      <DropdownMenuItem
                        key={status}
                        disabled={isStatusUpdating}
                        variant={variant}
                        onClick={() => patchRequestStatus(request.id, status)}
                      >
                        <Icon />
                        <span>{text}</span>
                      </DropdownMenuItem>
                    ))}
                <DropdownMenuSeparator />
                <DialogTrigger asChild>
                  <DropdownMenuItem>View summary</DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Summary</DialogTitle>
                <DialogDescription>
                  Summary provided by the user
                </DialogDescription>
              </DialogHeader>
              <div className="break-all">{request.summary}</div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      },
    },
  ].filter(Boolean);

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Filter emails..."
        value={table.getColumn("email")?.getFilterValue() ?? ""}
        onChange={(event) =>
          table.getColumn("email")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
