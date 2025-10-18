import { UserNav } from "@/apps/next-app/components/user-nav";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/apps/next-app/lib/db";
import { userRooms } from "@lib/schema";
import { auth } from "@/apps/next-app/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export async function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <img src="/frame.png" className="h-7 w-7" />
          <h1 className="text-xl font-bold text-foreground">
            <Link href="/">Predict</Link>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Suspense
            fallback={
              <Avatar>
                <AvatarFallback className=" text-primary-foreground">
                  {"?"}
                </AvatarFallback>
              </Avatar>
            }
          >
            <UserNav />
          </Suspense>

          {/* <div className="relative"></div> */}
        </div>
      </div>
    </header>
  );
}
