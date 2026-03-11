"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Domain, DomainStats } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Globe, Network, Server, Monitor, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DomainDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: domain, isLoading: domainLoading } = useQuery({
    queryKey: ["domain", id],
    queryFn: async () => {
      const res = await api.get<{ data: Domain }>(`/api/domains/${id}`);
      return res.data.data;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["domain-stats", id],
    queryFn: async () => {
      const res = await api.get<{ data: DomainStats }>(
        `/api/domains/${id}/stats`
      );
      return res.data.data;
    },
  });

  if (domainLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/domains">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Link>
        </Button>
        <p className="text-muted-foreground">Domain not found.</p>
      </div>
    );
  }

  const statItems = [
    { label: "Subdomains", value: stats?.subdomains, icon: Network, color: "text-green-500" },
    { label: "Ports", value: stats?.ports, icon: Server, color: "text-yellow-500" },
    { label: "Probed Hosts", value: stats?.probed_hosts, icon: Monitor, color: "text-purple-500" },
    { label: "Vulnerabilities", value: stats?.vulnerabilities, icon: ShieldAlert, color: "text-red-500" },
  ];

  const vulnBreakdown = stats?.vulnerability_breakdown;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/domains">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            {domain.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            ID: {domain.id} · Added{" "}
            {new Date(domain.created_at).toLocaleDateString()} ·{" "}
            <span
              className={`font-medium ${
                domain.is_scanned ? "text-green-500" : "text-muted-foreground"
              }`}>
              {domain.is_scanned ? "Scanned" : "Not scanned"}
            </span>
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "—" : (item.value ?? 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vulnerability Breakdown */}
      {vulnBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  ["critical", "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"],
                  ["high", "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"],
                  ["medium", "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"],
                  ["low", "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"],
                  ["info", "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"],
                ] as [keyof typeof vulnBreakdown, string][]
              ).map(([level, cls]) => (
                <span
                  key={level}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${cls}`}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}:{" "}
                  {vulnBreakdown[level]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
