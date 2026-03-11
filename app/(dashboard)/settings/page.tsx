"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { UserProfile, ApiToken } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Copy, LogOut, User, Key } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [tokenName, setTokenName] = useState("");
  const [tokenExpiry, setTokenExpiry] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get<{ data: UserProfile }>("/auth/profile");
      return res.data.data;
    },
  });

  const { data: tokensData } = useQuery({
    queryKey: ["api-tokens"],
    queryFn: async () => {
      const res = await api.get<{ data: ApiToken[] }>("/auth/tokens");
      return res.data.data;
    },
  });

  const createToken = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = { name: tokenName };
      if (tokenExpiry) body.expires_at = new Date(tokenExpiry).toISOString();
      const res = await api.post("/auth/tokens", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
      setTokenName("");
      setTokenExpiry("");
      toast.success("API token generated.");
    },
    onError: () => toast.error("Failed to generate token."),
  });

  const revokeToken = useMutation({
    mutationFn: (id: number) => api.delete(`/auth/tokens/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
      toast.success("Token revoked.");
    },
    onError: () => toast.error("Failed to revoke token."),
  });

  const copyToClipboard = (token: string, id: number) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and API access</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="font-medium">{profile.username}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect to the API to view profile.
            </p>
          )}
        </CardContent>
      </Card>

      {/* API Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Tokens
          </CardTitle>
          <CardDescription>
            Generate tokens for programmatic access to the API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Token */}
          <div className="space-y-3 p-4 border rounded-md bg-muted/30">
            <p className="text-sm font-medium">Generate New Token</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="token-name">Token Name</Label>
                <Input
                  id="token-name"
                  placeholder="e.g. CI Pipeline"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="token-expiry">Expires At (optional)</Label>
                <Input
                  id="token-expiry"
                  type="date"
                  value={tokenExpiry}
                  onChange={(e) => setTokenExpiry(e.target.value)}
                />
              </div>
            </div>
            {createToken.isError && (
              <p className="text-sm text-destructive">Failed to create token.</p>
            )}
            {createToken.data?.data?.token && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">
                  Your new token (copy it now, it won&apos;t be shown again):
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs break-all font-mono">
                    {createToken.data.data.token}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() =>
                      copyToClipboard(createToken.data.data.token, -1)
                    }>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            <Button
              size="sm"
              onClick={() => createToken.mutate()}
              disabled={!tokenName || createToken.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              {createToken.isPending ? "Generating..." : "Generate Token"}
            </Button>
          </div>

          <Separator />

          {/* Token List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Active Tokens</p>
            {tokensData && tokensData.length > 0 ? (
              tokensData.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="text-sm font-medium">{token.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(token.created_at).toLocaleDateString()}
                      {token.expires_at &&
                        ` · Expires ${new Date(token.expires_at).toLocaleDateString()}`}
                    </p>
                    {token.token && (
                      <div className="flex items-center gap-1 mt-1">
                        <code className="text-xs font-mono text-muted-foreground">
                          {token.token.slice(0, 20)}...
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(token.token!, token.id)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        {copiedId === token.id && (
                          <span className="text-xs text-green-600">Copied!</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revokeToken.mutate(token.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                No API tokens yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
