"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, Eye, EyeOff } from "lucide-react";

type ApiError = {
  response?: { data?: { message?: string } };
  code?: string;
  message?: string;
};

function getErrorInfo(error: unknown): { title: string; hint: string } {
  const err = error as ApiError;

  // No response at all → server is offline / unreachable
  if (!err.response) {
    return {
      title: "Cannot connect to the API server (port 8787).",
      hint:
        "The backend is not running. Start it with `wrangler dev` (or `npm run dev`) inside your Hono API project, then try again.",
    };
  }

  // Server replied with an error message
  const serverMsg = err.response?.data?.message;
  if (serverMsg) {
    return {
      title: serverMsg,
      hint: "Check the field highlighted above and correct it before retrying.",
    };
  }

  return {
    title: "Registration failed.",
    hint:
      "Common causes: username or email already in use, password too short (min 8 chars), or invalid email format.",
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.post("/auth/register", data);
      return res.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Register for Radon</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {mutation.isError && (() => {
              const { title, hint } = getErrorInfo(mutation.error);
              return (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 space-y-1">
                  <p className="text-sm font-medium text-destructive">{title}</p>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
              );
            })()}
            {mutation.isSuccess && (
              <p className="text-sm text-green-600">
                Account created! Redirecting to login...
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}>
              {mutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
