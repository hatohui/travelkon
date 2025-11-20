import { useState } from "react";

export const useExpenseForm = () => {
  const [image, setImage] = useState<File | null>(null);

  const onImageChange = (file: File | null) => {
    setImage(file);
  };

  return { image, onImageChange };
};
