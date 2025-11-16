"use client";

import React from "react";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Bell } from "lucide-react";

export function NotificationModal() {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <form>
        <DialogTrigger asChild>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
          >
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>🔔 Manage Notifications</DialogTitle>
            <DialogDescription>
              Configure your email and in-app notification preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Notification settings UI goes here.
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
