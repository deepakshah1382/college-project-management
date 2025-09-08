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
          <Button variant="outline" className="size-9 md:hidden">
            <span className="sr-only">Menu</span>
            <MenuIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40 md:hidden" align="end">
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
            className="text-foreground/75 transition-colors duration-300 ease-in-out text-sm hover:text-foreground/95"
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
