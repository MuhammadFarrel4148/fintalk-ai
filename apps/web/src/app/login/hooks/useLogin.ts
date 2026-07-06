"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface AuthUser {
  id: string;
  email: string;
}

async function loginRequest(email: string, password: string): Promise<AuthUser> {
  let res: Response;
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server.");
  }
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error?.message ?? "Login gagal. Periksa email dan password.");
  }
  return body.data;
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginRequest(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      router.push("/dashboard");
    },
  });

  return {
    login: (email: string, password: string) => mutation.mutate({ email, password }),
    isPending: mutation.isPending,
    errorMessage: mutation.error?.message ?? "",
  };
}
