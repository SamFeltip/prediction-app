"use client";

import { useState } from "react";
import { Button } from "@/apps/next-app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/apps/next-app/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreateMarketForm } from "@/apps/next-app/components/create-market-form";
import { useSession } from "@/apps/next-app/lib/auth-client";
import { useRouter } from "next/navigation";

export function CreateMarketButton({ roomId }: { roomId: number }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <Button onClick={() => router.push("/auth/signin")}>
        <Plus className="mr-2 h-4 w-4" />
        Create Wager
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Wager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Wager</DialogTitle>
          <DialogDescription>
            Create a wager. You'll resolve it when the deadline passes.
          </DialogDescription>
        </DialogHeader>
        <CreateMarketForm onSuccess={() => setOpen(false)} roomId={roomId} />
      </DialogContent>
    </Dialog>
  );
}
