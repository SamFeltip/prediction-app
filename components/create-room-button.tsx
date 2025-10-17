"use client";

import { Plus } from "lucide-react";
import CreateRoomForm from "./create-room-form";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";

export function CreateRoomButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Create a room. You can invite users to it later.
          </DialogDescription>
        </DialogHeader>
        <CreateRoomForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
