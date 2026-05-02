"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Button, 
  Input, 
  PasswordInput,
  FormField 
} from "@tasheen/ui";
import { useChangeEmail } from "../hooks/useChangeEmail";
import { Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

const changeEmailFormSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Current password is required to authorize this change"),
});

type ChangeEmailFormValues = z.infer<typeof changeEmailFormSchema>;

export function ChangeEmailForm({ onSuccess }: { onSuccess: () => void }) {
  const changeEmail = useChangeEmail();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailFormSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    try {
      await changeEmail.mutateAsync({
        newEmail: data.newEmail,
        password: data.password
      });
      reset();
      onSuccess();
    } catch (err: any) {
      setServerError(err.message || "Failed to initiate email change.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6 pt-4 pb-2">
      <div className="text-center space-y-1 mb-8">
        <p className="text-xs text-stone-500 uppercase tracking-widest font-medium">
          Security Verification
        </p>
        <p className="text-sm text-stone-400">
          Enter your new email and authorize with your password.
        </p>
      </div>

      <div className="space-y-8">
        <FormField 
          id="newEmail" 
          label="New Email Address" 
          error={errors.newEmail?.message}
        >
          <Input 
            id="newEmail" 
            type="email"
            placeholder="example@tasheen.com" 
            className="text-base"
            {...register("newEmail")} 
          />
        </FormField>

        <FormField 
          id="password" 
          label="Current Password" 
          error={errors.password?.message}
        >
          <PasswordInput 
            id="password" 
            placeholder="••••••••" 
            className="text-base"
            {...register("password")} 
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
          Update Email
        </Button>
      </div>
      
      <p className="text-[10px] text-stone-400 text-center uppercase tracking-tighter leading-tight mt-4">
        A verification link will be sent to your new address to finalize the process.
      </p>
    </form>
  );
}
