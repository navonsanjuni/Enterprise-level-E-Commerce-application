"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInFormSchema,
  type SignInFormValues,
} from "@tasheen/validation/auth";
import {
  Button,
  Input,
  PasswordInput,
  Checkbox,
  FormField,
} from "@tasheen/ui";
import { useLogin } from "../hooks/useLogin";

export function SignInForm() {
  const router = useRouter();
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login.mutateAsync({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      router.push("/account");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Sign in failed");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl text-charcoal">Welcome back</h1>
        <p className="text-sm text-slate-muted">
          Sign in to access your artisanal heritage account.
        </p>
      </header>

      <FormField id="email" label="Email address" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          hasError={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>

      <div className="space-y-2">
        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            placeholder="Password"
            autoComplete="current-password"
            hasError={Boolean(errors.password)}
            {...register("password")}
          />
        </FormField>
      </div>

      <div className="flex items-center justify-between">
        <label 
          htmlFor="rememberMe" 
          className="flex items-center gap-2 text-xs text-charcoal cursor-pointer group select-none"
        >
          <Checkbox id="rememberMe" {...register("rememberMe")} />
          <span className="group-hover:text-gold transition-colors">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-burgundy hover:text-gold underline underline-offset-4"
        >
          Forgot password?
        </Link>
      </div>

      {serverError && (
        <p className="text-[11px] text-burgundy" role="alert">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting || login.isPending}
      >
        Sign In
      </Button>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-muted">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button type="button" variant="ghost" size="md" className="flex gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
        <Button type="button" variant="ghost" size="md" className="flex gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.96 0-2.04-.54-3.12-.54-1.08 0-2.16.54-3.12.54-2.16 0-4.08-2.28-4.08-5.04 0-3.36 2.28-5.16 4.44-5.16.96 0 2.04.54 3.12.54 1.08 0 2.16-.54 3.12-.54 1.56 0 2.88.96 3.6 2.28-2.76 1.44-2.28 5.16.6 6.36-.6 1.44-2.04 3.12-4.56 3.12zM12.01 9.12c-.12-2.16 1.68-4.08 3.72-4.2 0 0 .12 2.16-1.68 4.08-1.92 1.92-2.04.12-2.04.12z" />
          </svg>
          Apple
        </Button>
      </div>

      <p className="text-center text-xs text-slate-muted pt-4">
        New here?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-charcoal underline underline-offset-4 hover:text-gold"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
