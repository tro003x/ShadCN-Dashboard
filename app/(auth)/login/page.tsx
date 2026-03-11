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
};

function getLoginErrorInfo(error: unknown): { title: string; hint: string } {
  const err = error as ApiError;
  if (!err.response) {
    return {
      title: "Cannot connect to the API server (port 8787).",
      hint:
        "The backend is not running. Start it with `wrangler dev` inside your Hono API project, then try again.",
    };
  }
  const serverMsg = err.response?.data?.message;
  if (serverMsg) {
    return { title: serverMsg, hint: "" };
  }
  return {
    title: "Invalid credentials.",
    hint: "Double-check your username and password and try again.",
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.data?.token) {
        document.cookie = `token=${data.data.token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }; SameSite=Strict`;
      }
      router.push("/dashboard");
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
          <CardTitle className="text-2xl">Radon</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
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
              const { title, hint } = getLoginErrorInfo(mutation.error);
              return (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 space-y-1">
                  <p className="text-sm font-medium text-destructive">{title}</p>
                  {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                </div>
              );
            })()}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-primary">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
