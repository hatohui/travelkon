"use client";

import { useState } from "react";
import { useAddEventMember } from "@/hooks/events/useEvents";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface InviteMemberDialogProps {
  eventId: string;
}

export function InviteMemberDialog({ eventId }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");

  const inviteMutation = useAddEventMember();

  inviteMutation.isSuccess &&
    (() => {
      toast.success("Member invited successfully!");
      setOpen(false);
      setEmail("");
      setRole("MEMBER");
    })();

  inviteMutation.isError && toast.error("Failed to invite member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    inviteMutation.mutate({ eventId, data: { email: email.trim(), role } });
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
            Add someone to this event. They&apos;ll be able to view and add
            expenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "MEMBER" | "ADMIN")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">
                  <div>
                    <div className="font-medium">Member</div>
                    <div className="text-xs text-muted-foreground">
                      Can view and add expenses
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-muted-foreground">
                      Can manage members and settings
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteMutation.isPending}
              className="flex-1"
            >
              {inviteMutation.isPending ? "Inviting..." : "Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
