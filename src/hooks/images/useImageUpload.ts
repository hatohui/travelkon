import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ImageFolder } from "@/common/cloudinary";

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

export function useImageSignature() {
  return useMutation({
    mutationFn: async (folder: ImageFolder) => {
      const { data } = await axios.post<CloudinarySignature>(
        "/api/images/sign",
        { folder }
      );
      return data;
    },
  });
}

export function useImageUpload() {
  const { mutateAsync: getSignature } = useImageSignature();

  return useMutation({
    mutationFn: async ({
      file,
      folder,
      onProgress,
    }: {
      file: File;
      folder: ImageFolder;
      onProgress?: (progress: number) => void;
    }): Promise<UploadResult> => {
      // Get signature from backend
      const signData = await getSignature(folder);

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
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    },
  });
}
