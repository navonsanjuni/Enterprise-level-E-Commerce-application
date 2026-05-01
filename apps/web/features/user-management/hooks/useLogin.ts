"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api";
import { authQueryKeys } from "./queryKeys";
import type { AuthResult } from "../types";
import type { LoginRequest } from "@tasheen/validation/auth";
import type { ApiCallError } from "../api";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<AuthResult, ApiCallError, LoginRequest>({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.identity() });
    },
  });
}
