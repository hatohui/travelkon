"use client";
import CloudinaryImageInput from "@/components/common/CloudinaryImageInput";
import { useExpenseForm } from "@/hooks/expenses/useExpenseForm";
import React from "react";

const Page = (): React.ReactElement => {
  const { onImageChange } = useExpenseForm();

  return (
    <div>
      <CloudinaryImageInput onChange={onImageChange} />
    </div>
  );
};

export default Page;
