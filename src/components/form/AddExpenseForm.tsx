import React from "react";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z4 from "zod/v4";
import { Input } from "../ui/input";

const AddExpenseForm = () => {
  const formSchema = z4.object({
    description: z4
      .string()
      .min(5, "Description must be at least 5 characters long")
      .max(40, "Description must be max 40 characters long"),
    image: z4.file(),
  });

  const form = useForm<z4.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      image: undefined,
    },
  });

  return (
    <CardContent>
      <form onSubmit={form.handleSubmit((data) => console.log(data))}>
        <FieldGroup>
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input id="input-description" autoComplete="off" {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="image"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="image">Image</FieldLabel>
                <Input
                  id="input-image"
                  type="file"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </CardContent>
  );
};

export default AddExpenseForm;
