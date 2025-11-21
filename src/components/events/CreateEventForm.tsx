"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCreateEvent } from "@/hooks/events/useEvents";
import { useImageUpload } from "@/hooks/images/useImageUpload";
import { X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

const createEventSchema = z
  .object({
    name: z.string().min(1, "Event name is required").max(100),
    description: z.string().optional(),
    startAt: z.string().min(1, "Start date is required"),
    endAt: z.string().min(1, "End date is required"),
    coverImage: z.string().optional(),
  })
  .refine((data) => new Date(data.endAt) >= new Date(data.startAt), {
    message: "End date must be on or after start date",
    path: ["endAt"],
  });

type CreateEventFormData = z.infer<typeof createEventSchema>;

export function CreateEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
  });

  const createEventMutation = useCreateEvent();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setValue("coverImage", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CreateEventFormData) => {
    setIsSubmitting(true);
    try {
      // Upload cover image if selected
      if (coverImageFile) {
        const { url } = await uploadImage({
          file: coverImageFile,
          folder: "trips",
          onProgress: setUploadProgress,
        });
        data.coverImage = url;
      }

      const result = await createEventMutation.mutateAsync({
        ...data,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
      });

      toast.success("Event created successfully!");
      router.push(`/events/${result.id}`);
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message || "Failed to create event"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Cover Image Upload */}
      <div className="space-y-2">
        <Label>Cover Image (Optional)</Label>
        {coverImagePreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={coverImagePreview}
              alt="Cover preview"
              fill
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={isUploading || isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-sm">
                  Uploading... {uploadProgress}%
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              Click to upload cover image
            </div>
            <div className="text-xs text-gray-400">PNG, JPG up to 10MB</div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
          disabled={isUploading || isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Event Name *</Label>
        <Input
          id="name"
          placeholder="Summer Trip to Japan"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          placeholder="Describe your trip..."
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startAt">Start Date *</Label>
          <Input id="startAt" type="date" {...register("startAt")} />
          {errors.startAt && (
            <p className="text-sm text-red-600">{errors.startAt.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endAt">End Date *</Label>
          <Input id="endAt" type="date" {...register("endAt")} />
          {errors.endAt && (
            <p className="text-sm text-red-600">{errors.endAt.message}</p>
          )}
        </div>
      </div>

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
          disabled={isSubmitting || isUploading}
          className="flex-1"
        >
          {isUploading
            ? `Uploading... ${uploadProgress}%`
            : isSubmitting
            ? "Creating..."
            : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
