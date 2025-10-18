"use client";

import { signOut } from "@/apps/next-app/lib/auth-client";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/apps/next-app/components/ui/dropdown-menu";

import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";

export function UserDropdown({
  user,
  initials,
  count,
}: {
  user: { name: string; email: string };
  initials: string;
  count: number;
}) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative rounded-full h-8 w-8 bg-primary text-primary-foreground"
        >
          <Avatar>
            <AvatarFallback className="">{initials}</AvatarFallback>
          </Avatar>
          {count > 0 && (
            <span className="absolute top-[-5px] right-[-5px] block w-5 h-5 bg-red-500 rounded-full">
              {count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>
              <span className="pe-2">Profile</span>
              {count > 0 && <Badge>{count} invites</Badge>}
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
          className="text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
