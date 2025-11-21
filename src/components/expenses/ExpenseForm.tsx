"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useEvent } from "@/hooks/events/useEvents";
import { useCreateExpense } from "@/hooks/expenses/useExpenses";
import { useImageUpload } from "@/hooks/images/useImageUpload";
import { X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { CurrencySelector } from "@/components/common/CurrencySelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const createExpenseSchema = z.object({
  eventId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(255),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().min(3, "Currency is required").max(3),
  description: z.string().optional(),
  category: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  location: z.string().optional(),
  paidByUserId: z.string().uuid(),
  splits: z.array(
    z.object({
      userId: z.string().uuid(),
      amount: z.number().positive(),
    })
  ),
  images: z.array(z.string()).optional(),
});

type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

interface EventMember {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Event {
  id: string;
  name: string;
  members: EventMember[];
}

interface ExpenseFormProps {
  userId: string;
}

export function ExpenseForm({ userId }: ExpenseFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams?.get("eventId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ url: string; preview: string }>
  >([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload();
  const createExpenseMutation = useCreateExpense();

  // Fetch event details  
  const { data: event } = useEvent(eventId || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      eventId: eventId || "",
      paidByUserId: userId,
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const amount = watch("amount");  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return false;
      }
      return true;
    });

    setImageFiles((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prev) => [
          ...prev,
          { url: "", preview: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const onSubmit = async (data: CreateExpenseFormData) => {
    if (selectedMembers.size === 0) {
      toast.error("Please select at least one member to split with");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images if any
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const { url } = await uploadImage(file, "expenses");
        imageUrls.push(url);
      }

      // Calculate equal splits
      const splitAmount = data.amount / selectedMembers.size;
      const splits = Array.from(selectedMembers).map((memberId) => ({
        userId: memberId,
        amount: splitAmount,
      }));

      await createExpenseMutation.mutateAsync({
        ...data,
        splits,
        images: imageUrls,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!eventId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Please select an event first</p>
          <Button onClick={() => router.push("/events")} className="mt-4">
            Go to Events
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>Add a new expense to {event.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Images */}
          <div className="space-y-2">
            <Label>Images (Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <Image
                    src={img.preview}
                    alt={`Expense ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {uploadedImages.length < 4 && (
                <div
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                  <div className="text-xs text-gray-600">Add Image</div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="text-sm text-muted-foreground">
                Uploading images... {progress}%
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Dinner at restaurant"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CurrencySelector
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting || isUploading}
                  />
                )}
              />
              {errors.currency && (
                <p className="text-sm text-red-600">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Add more details..."
              className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("description")}
            />
          </div>

          {/* Category and Date */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Food, Transport, etc."
                {...register("category")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where was this expense?"
              {...register("location")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Split With</CardTitle>
          <CardDescription>
            Select members to split this expense with
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {event.members.map((member) => {
            const isSelected = selectedMembers.has(member.user.id);
            const splitAmount =
              amount && selectedMembers.size > 0
                ? (amount / selectedMembers.size).toFixed(2)
                : "0.00";

            return (
              <div
                key={member.user.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                onClick={() => toggleMember(member.user.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleMember(member.user.id)}
                  />
                  <div>
                    <div className="font-medium">
                      {member.user.name || "Unknown"}
                      {member.user.id === userId && (
                        <span className="text-muted-foreground ml-2">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.user.email}
                    </div>
                  </div>
                </div>
                {isSelected && amount > 0 && (
                  <div className="text-sm font-medium">
                    {watch("currency")} {splitAmount}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting || isUploading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading || selectedMembers.size === 0}
          className="flex-1"
        >
          {isUploading
            ? `Uploading... ${progress}%`
            : isSubmitting
            ? "Adding..."
            : "Add Expense"}
        </Button>
      </div>
    </form>
  );
}
