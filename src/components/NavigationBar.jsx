import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function NavigationBar({ menuItems }) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="size-9 text-black md:hidden">
            <span className="sr-only">Menu</span>
            <MenuIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-40 bg-blue-50 text-blue-950 md:hidden"
          align="end"
        >
          {menuItems.map(({ name, href, id }) => (
            <DropdownMenuItem key={id} asChild>
              <a href={href}>{name}</a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <nav className="hidden md:flex items-center gap-4">
        {menuItems.map(({ name, href, id }) => (
          <a
            className="opacity-80 transition-all duration-300 ease-in-out text-sm hover:opacity-100 hover:scale-104"
            key={id}
            href={href}
          >
            {name}
          </a>
        ))}
      </nav>
    </>
  );
}
