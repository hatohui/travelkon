"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShareUrlDialogProps {
  eventId: string;
  eventName: string;
}

export function ShareUrlDialog({ eventId, eventName }: ShareUrlDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/expenses?eventId=${eventId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share event
        </CardTitle>
        <CardDescription>
          Anyone with this link can view and join this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Get share link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share &quot;{eventName}&quot;</DialogTitle>
              <DialogDescription>
                Share this link with anyone. If they&apos;re not registered,
                they&apos;ll be prompted to sign in or create an account.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button onClick={handleCopy} size="icon" variant="outline">
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              💡 Tip: New users will need to sign in or register before they can
              view the event
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
