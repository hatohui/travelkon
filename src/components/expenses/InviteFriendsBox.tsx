"use client";

import { useState } from "react";
import { useInviteToEvent } from "@/hooks/events/useEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface InviteFriendsBoxProps {
  eventId: string;
}

export function InviteFriendsBox({ eventId }: InviteFriendsBoxProps) {
  const [email, setEmail] = useState("");

  const inviteMutation = useInviteToEvent();

  if (inviteMutation.isSuccess) {
    toast.success("Invitation sent successfully!");
    setEmail("");
    inviteMutation.reset();
  }

  if (inviteMutation.isError) {
    toast.error("Failed to send invitation");
    inviteMutation.reset();
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    inviteMutation.mutate({ eventId, emails: [email] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite friends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter an email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={inviteMutation.isPending}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={inviteMutation.isPending}
          >
            {inviteMutation.isPending ? "Sending..." : "Send invite"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
