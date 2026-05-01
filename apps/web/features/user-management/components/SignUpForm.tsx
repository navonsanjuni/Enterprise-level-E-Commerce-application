"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signUpFormSchema,
  type SignUpFormValues,
} from "@tasheen/validation/auth";
import {
  Button,
  Input,
  PasswordInput,
  Checkbox,
  FormField,
  PasswordStrengthMeter,
} from "@tasheen/ui";
import { useRegister } from "../hooks/useRegister";

const TERMS_HREF = "/legal/terms";
const PRIVACY_HREF = "/legal/privacy";

export function SignUpForm() {
  const router = useRouter();
  const register = useRegister();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    control,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const passwordValue = watch("password");

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await register.mutateAsync({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      router.push("/account");
    } catch (err) {
      if (
        err instanceof Error &&
        "fieldErrors" in err &&
        (err as { fieldErrors?: Record<string, string> }).fieldErrors
      ) {
        const fieldErrors = (err as { fieldErrors: Record<string, string> })
          .fieldErrors;
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (
            field === "email" ||
            field === "password" ||
            field === "firstName" ||
            field === "lastName"
          ) {
            setError(field, { type: "server", message });
          }
        }
      }
      setServerError(err instanceof Error ? err.message : "Sign up failed");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl text-charcoal">Begin your story</h1>
        <p className="text-sm text-slate-muted">
          Create an account to access bespoke services and artisanal collections.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-x-6">
        <FormField
          id="firstName"
          label="First Name"
          error={errors.firstName?.message}
        >
          <Input
            id="firstName"
            placeholder="First Name"
            autoComplete="given-name"
            hasError={Boolean(errors.firstName)}
            {...registerField("firstName")}
          />
        </FormField>
        <FormField
          id="lastName"
          label="Last Name"
          error={errors.lastName?.message}
        >
          <Input
            id="lastName"
            placeholder="Last Name"
            autoComplete="family-name"
            hasError={Boolean(errors.lastName)}
            {...registerField("lastName")}
          />
        </FormField>
      </div>

      <FormField id="email" label="Email Address" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          hasError={Boolean(errors.email)}
          {...registerField("email")}
        />
      </FormField>

      <div>
        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            placeholder="Password"
            autoComplete="new-password"
            hasError={Boolean(errors.password)}
            {...registerField("password")}
          />
        </FormField>
        <PasswordStrengthMeter password={passwordValue ?? ""} />
      </div>

      <FormField
        id="confirmPassword"
        label="Confirm Password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm Password"
          autoComplete="new-password"
          hasError={Boolean(errors.confirmPassword)}
          {...registerField("confirmPassword")}
        />
      </FormField>

      <Controller
        control={control}
        name="agreeToTerms"
        render={({ field }) => (
          <div className="space-y-1">
            <label className="flex items-start gap-3 text-xs text-charcoal">
              <span className="pt-0.5">
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  hasError={Boolean(errors.agreeToTerms)}
                />
              </span>
              <span className="leading-relaxed">
                I agree to the{" "}
                <Link
                  href={TERMS_HREF}
                  className="font-medium underline underline-offset-2 hover:text-gold"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href={PRIVACY_HREF}
                  className="font-medium underline underline-offset-2 hover:text-gold"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agreeToTerms ? (
              <p className="text-[11px] text-burgundy" role="alert">
                {errors.agreeToTerms.message}
              </p>
            ) : null}
          </div>
        )}
      />

      {serverError && !Object.keys(errors).length ? (
        <p className="text-[11px] text-burgundy" role="alert">
          {serverError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting || register.isPending}
      >
        Create Account
      </Button>

      <p className="text-center text-xs text-slate-muted">
        Already a member?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-charcoal underline underline-offset-4 hover:text-gold"
        >
          Sign in here
        </Link>
      </p>
    </form>
  );
}
