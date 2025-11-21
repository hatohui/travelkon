"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Copy, Check } from "lucide-react";

interface InviteMemberDialogProps {
  eventId: string;
}

export function InviteMemberDialog({ eventId }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate invite URL
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/join/${eventId}`
      : "";

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member to Event</DialogTitle>
          <DialogDescription>
            Share this link with anyone you want to add to this event. They will
            need to sign in with their Google account to join.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-url">Invite Link</Label>
            <div className="flex gap-2">
              <Input
                id="invite-url"
                value={inviteUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyUrl}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can join as a member of this event.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button type="button" onClick={handleCopyUrl} className="flex-1">
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
