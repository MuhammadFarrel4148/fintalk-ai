"use client";
import { useQuery } from "@tanstack/react-query";

interface AuthUser {
  id: string;
  email: string;
  balance: number;
}

async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body?.data ?? null;
}

export function useAuth() {
  const { data: user = null, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    retry: false,
  });

  return { user, isLoading };
}
