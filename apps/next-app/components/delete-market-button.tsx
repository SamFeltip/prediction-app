"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/apps/next-app/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { DialogFooter, DialogHeader } from "./ui/dialog";
import { useState } from "react";

export function DeleteMarketButton({
  title,
  onDelete,
}: {
  title: string;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoading = async () => {
    setLoading(true);
    await onDelete();
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Delete Wager</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the <i>{title}</i> wager? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              type="submit"
              className="w-full"
              disabled={loading}
              onClick={handleLoading}
            >
              {loading ? "Deleting..." : "Delete Wager"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
