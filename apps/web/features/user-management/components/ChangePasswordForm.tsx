"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Button, 
  PasswordInput, 
  FormField 
} from "@tasheen/ui";
import { useChangePassword } from "../hooks/useChangePassword";
import { Check, AlertCircle, Loader2 } from "lucide-react";

// Matches the design and the backend schema
const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Entries do not match. Please verify your input.",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const changePassword = useChangePassword();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      reset();
      onSuccess();
    } catch (err: any) {
      setServerError(err.message || "Failed to update security credentials.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4 pb-2">
      <div className="text-center space-y-1 mb-6">
        <p className="text-xs text-stone-500 uppercase tracking-widest font-medium">
          Authorization Required
        </p>
        <p className="text-sm text-stone-400">
          Please enter your credentials to authorize changes.
        </p>
      </div>

      <div className="space-y-6">
        <FormField 
          id="currentPassword" 
          label="Current Password" 
          error={errors.currentPassword?.message}
        >
          <PasswordInput 
            id="currentPassword" 
            placeholder="••••••••" 
            className="text-base"
            {...register("currentPassword")} 
          />
        </FormField>

        <FormField 
          id="newPassword" 
          label="New Value (Password)" 
          error={errors.newPassword?.message}
        >
          <PasswordInput 
            id="newPassword" 
            placeholder="Enter new credential" 
            className="text-base"
            {...register("newPassword")} 
          />
        </FormField>

        <FormField 
          id="confirmPassword" 
          label="Confirm New Value" 
          error={errors.confirmPassword?.message}
        >
          <PasswordInput 
            id="confirmPassword" 
            placeholder="Re-enter for confirmation" 
            className="text-base border-stone-200"
            {...register("confirmPassword")} 
          />
        </FormField>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 p-4 bg-burgundy/5 text-burgundy text-xs rounded animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          {serverError}
        </div>
      )}

      <div className="pt-6">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          className="uppercase tracking-widest font-bold h-14"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
