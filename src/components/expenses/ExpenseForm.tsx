"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

interface MemberSplit {
  amount: number;
  percentage: number;
}

interface ExpenseFormProps {
  userId: string;
}

export function ExpenseForm({ userId }: ExpenseFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams?.get("eventId");

  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [splitMode, setSplitMode] = useState<"equal" | "percentage">("equal");
  const [splits, setSplits] = useState<Map<string, MemberSplit>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload state
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

  // Calculate selected members from splits map
  const selectedMembers = useMemo(() => Array.from(splits.keys()), [splits]);
  // Calculate total split amount or percentage
  const totalSplitAmount = useMemo(() => {
    return selectedMembers.reduce((sum, memberId) => {
      const split = splits.get(memberId);
      return sum + (split?.amount || 0);
    }, 0);
  }, [selectedMembers, splits]);

  const totalSplitPercentage = useMemo(() => {
    return selectedMembers.reduce((sum, memberId) => {
      const split = splits.get(memberId);
      return sum + (split?.percentage || 0);
    }, 0);
  }, [selectedMembers, splits]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setSplits((prev) => {
      const newSplits = new Map(prev);
      if (newSplits.has(memberId)) {
        newSplits.delete(memberId);
      } else {
        const expenseAmount = parseFloat(amount) || 0;
        const currentSelected = prev.size;
        const splitAmount = expenseAmount / (currentSelected + 1);
        const splitPercentage = 100 / (currentSelected + 1);

        // Update all splits with new equal amounts
        newSplits.forEach((_, id) => {
          newSplits.set(id, {
            amount: splitAmount,
            percentage: splitPercentage,
          });
        });
        newSplits.set(memberId, {
          amount: splitAmount,
          percentage: splitPercentage,
        });
      }
      return newSplits;
    });
  };

  const handleSplitEqually = () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }
    const expenseAmount = parseFloat(amount) || 0;
    const splitAmount = expenseAmount / selectedMembers.length;
    const splitPercentage = 100 / selectedMembers.length;

    setSplits((prev) => {
      const newSplits = new Map(prev);
      selectedMembers.forEach((id) => {
        newSplits.set(id, { amount: splitAmount, percentage: splitPercentage });
      });
      return newSplits;
    });
  };

  const handleAllMe = () => {
    const expenseAmount = parseFloat(amount) || 0;
    setSplits(new Map([[userId, { amount: expenseAmount, percentage: 100 }]]));
  };

  const handleAllThem = (otherUserId: string) => {
    const expenseAmount = parseFloat(amount) || 0;
    setSplits(
      new Map([[otherUserId, { amount: expenseAmount, percentage: 100 }]])
    );
  };

  const updateSplitAmount = (memberId: string, newAmount: string) => {
    const numAmount = parseFloat(newAmount) || 0;
    const expenseAmount = parseFloat(amount) || 0;
    const percentage =
      expenseAmount > 0 ? (numAmount / expenseAmount) * 100 : 0;

    setSplits((prev) => {
      const newSplits = new Map(prev);
      newSplits.set(memberId, { amount: numAmount, percentage });
      return newSplits;
    });
  };

  const updateSplitPercentage = (memberId: string, newPercentage: string) => {
    const numPercentage = parseFloat(newPercentage) || 0;
    const expenseAmount = parseFloat(amount) || 0;
    const splitAmount = (expenseAmount * numPercentage) / 100;

    setSplits((prev) => {
      const newSplits = new Map(prev);
      newSplits.set(memberId, {
        amount: splitAmount,
        percentage: numPercentage,
      });
      return newSplits;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member to split with");
      return;
    }
    if (
      splitMode === "percentage" &&
      Math.abs(totalSplitPercentage - 100) > 0.01
    ) {
      toast.error(
        `Split percentages must total 100% (currently ${totalSplitPercentage.toFixed(
          1
        )}%)`
      );
      return;
    }
    if (splitMode === "equal") {
      const expenseAmount = parseFloat(amount);
      if (Math.abs(totalSplitAmount - expenseAmount) > 0.01) {
        toast.error(`Split amounts must equal expense amount`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Upload images if any
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const { url } = await uploadImage({
          file,
          folder: "expenses",
          onProgress: setUploadProgress,
        });
        imageUrls.push(url);
      }

      // Calculate splits with amounts
      const splitData = selectedMembers.map((memberId) => {
        const split = splits.get(memberId);
        return {
          userId: memberId,
          amount: split?.amount || 0,
        };
      });

      await createExpenseMutation.mutateAsync({
        eventId: eventId!,
        title,
        description: description || undefined,
        amount: parseFloat(amount),
        currency,
        date: new Date(date).toISOString(),
        paidByUserId: userId,
        splits: splitData,
        category: category || undefined,
        location: location || undefined,
        images: imageUrls,
      });

      toast.success("Expense added successfully!");
      router.push(`/expenses?eventId=${eventId}`);
    } catch (error) {
      toast.error("Failed to create expense");
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 md:space-y-6 pb-24 md:pb-0"
    >
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
                Uploading images... {uploadProgress}%
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Dinner at restaurant"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Amount and Currency */}
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <CurrencySelector
                value={currency}
                onChange={setCurrency}
                disabled={isSubmitting || isUploading}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Add more details..."
              className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category and Date */}
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Food, Transport, etc."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where was this expense?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Split With</CardTitle>
          <CardDescription>
            Select members and choose how to split
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSplitEqually}
              disabled={selectedMembers.length === 0}
            >
              Split Equally
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAllMe}
            >
              All Me
            </Button>
            {event.members
              ?.filter((m) => m.user.id !== userId)
              .slice(0, 1)
              .map((member) => (
                <Button
                  key={member.user.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAllThem(member.user.id)}
                >
                  All {member.user.name?.split(" ")[0] || "Them"}
                </Button>
              ))}
          </div>

          {/* Split Mode Tabs */}
          <Tabs
            value={splitMode}
            onValueChange={(v) => setSplitMode(v as "equal" | "percentage")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="equal">Equal Split</TabsTrigger>
              <TabsTrigger value="percentage">Custom %</TabsTrigger>
            </TabsList>

            <TabsContent value="equal" className="space-y-3 mt-4">
              {/* Member Selection */}
              {event.members?.map((member) => {
                const isSelected = splits.has(member.user.id);
                const split = splits.get(member.user.id);
                const splitAmount = split?.amount || 0;

                return (
                  <div
                    key={member.user.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMember(member.user.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm md:text-base">
                          {member.user.name || "Unknown"}
                          {member.user.id === userId && (
                            <span className="text-muted-foreground ml-2 text-xs md:text-sm">
                              (You)
                            </span>
                          )}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="text-sm font-medium">
                        {currency} {splitAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                );
              })}
              {selectedMembers.length > 0 && (
                <div className="text-sm text-muted-foreground text-right">
                  Total: {currency} {totalSplitAmount.toFixed(2)} /{" "}
                  {amount || "0.00"}
                </div>
              )}
            </TabsContent>

            <TabsContent value="percentage" className="space-y-3 mt-4">
              {/* Member Selection with Percentage Inputs */}
              {event.members?.map((member) => {
                const isSelected = splits.has(member.user.id);
                const split = splits.get(member.user.id);
                const splitPercentage = split?.percentage || 0;
                const splitAmount = split?.amount || 0;

                return (
                  <div
                    key={member.user.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMember(member.user.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm md:text-base truncate">
                          {member.user.name || "Unknown"}
                          {member.user.id === userId && (
                            <span className="text-muted-foreground ml-2 text-xs md:text-sm">
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={splitPercentage.toFixed(2)}
                          onChange={(e) =>
                            updateSplitPercentage(
                              member.user.id,
                              e.target.value
                            )
                          }
                          className="w-20 h-9 text-sm"
                        />
                        <span className="text-sm">%</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          = {currency} {splitAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {selectedMembers.length > 0 && (
                <div
                  className={`text-sm text-right ${
                    Math.abs(totalSplitPercentage - 100) > 0.01
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  Total: {totalSplitPercentage.toFixed(1)}% / 100%
                  {Math.abs(totalSplitPercentage - 100) > 0.01 && " ⚠️"}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed md:relative bottom-0 left-0 right-0 p-4 bg-background border-t md:border-0 flex gap-3 z-10">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting || isUploading}
          className="flex-1 h-11 md:h-10 text-base md:text-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex-1 h-11 md:h-10 text-base md:text-sm"
        >
          {isUploading
            ? `Uploading... ${uploadProgress}%`
            : isSubmitting
            ? "Adding..."
            : "Add Expense"}
        </Button>
      </div>
    </form>
  );
}
