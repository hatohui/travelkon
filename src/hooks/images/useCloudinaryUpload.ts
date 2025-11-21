"use client";

import { useState } from "react";
import { ImageFolder } from "@/common/cloudinary";
import axios from "axios";

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apikey: string;
  cloudName: string;
  folder: string;
}

interface UploadResult {
  url: string;
  publicId: string;
}

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (
    file: File,
    folder: ImageFolder
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Get signature from backend
      const { data: signData } = await axios.post<CloudinarySignature>(
        "/api/images/sign",
        { folder }
      );

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signData.signature);
      formData.append("timestamp", signData.timestamp.toString());
      formData.append("api_key", signData.apikey);
      formData.append("folder", signData.folder);

      // Upload to Cloudinary
      const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setProgress(percentCompleted);
          },
        }
      );

      setProgress(100);
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    progress,
  };
}
