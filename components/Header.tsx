import { CreateMarketButton } from "@/components/create-market-button";
import { UserNav } from "@/components/user-nav";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            <Link href="/">PredictHub</Link>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <CreateMarketButton />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
