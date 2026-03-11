"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";
import { Subdomain, Port, ProbedHost, Vulnerability } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Network } from "lucide-react";
import Link from "next/link";

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  info: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusBg = (code: number) => {
  if (code < 300) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (code < 400) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  if (code < 500) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
};

const portColumns: ColumnDef<Port>[] = [
  { accessorKey: "host", header: "Host" },
  { accessorKey: "ip", header: "IP" },
  { accessorKey: "port", header: "Port" },
  { accessorKey: "protocol", header: "Protocol" },
  {
    accessorKey: "tls",
    header: "TLS",
    cell: ({ row }) => (row.original.tls ? "Yes" : "No"),
  },
];

const probedColumns: ColumnDef<ProbedHost>[] = [
  { accessorKey: "url", header: "URL" },
  {
    accessorKey: "status_code",
    header: "Status",
    cell: ({ row }) => {
      const code = row.original.status_code;
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBg(code)}`}>
          {code}
        </span>
      );
    },
  },
  { accessorKey: "title", header: "Title" },
];

const vulnColumns: ColumnDef<Vulnerability>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const s = row.getValue("severity") as string;
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[s] ?? severityColors.info}`}>
          {s}
        </span>
      );
    },
  },
  { accessorKey: "port", header: "Port" },
];

export default function SubdomainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [portPage, setPortPage] = useState(1);
  const [probedPage, setProbedPage] = useState(1);
  const [vulnPage, setVulnPage] = useState(1);

  const { data: subdomain, isLoading } = useQuery({
    queryKey: ["subdomain", id],
    queryFn: async () => {
      const res = await api.get<{ data: Subdomain }>(`/api/subdomains/${id}`);
      return res.data.data;
    },
  });

  const { data: portsData, isLoading: portsLoading } = useQuery({
    queryKey: ["ports-by-subdomain", subdomain?.name, portPage],
    enabled: !!subdomain?.name,
    queryFn: async () => {
      const res = await api.get(
        `/api/ports?subdomain=${subdomain!.name}&page=${portPage}&limit=10`
      );
      return res.data;
    },
  });

  const { data: vulnsData, isLoading: vulnsLoading } = useQuery({
    queryKey: ["vulns-by-subdomain", id, vulnPage],
    queryFn: async () => {
      const res = await api.get(`/api/vulns?page=${vulnPage}&limit=10`);
      return res.data;
    },
  });

  const { data: probedData, isLoading: probedLoading } = useQuery({
    queryKey: ["probed-by-subdomain", id, probedPage],
    queryFn: async () => {
      const res = await api.get(`/api/probed?page=${probedPage}&limit=10`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!subdomain) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/subdomains">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Link>
        </Button>
        <p className="text-muted-foreground">Subdomain not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/subdomains">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-5 w-5 text-green-500" />
            {subdomain.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            ID: {subdomain.id} · Domain: {subdomain.domain ?? "—"} · Added{" "}
            {new Date(subdomain.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Ports */}
      <Card>
        <CardHeader>
          <CardTitle>Ports</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={portColumns}
            data={portsData?.data ?? []}
            total={portsData?.pagination?.total ?? 0}
            page={portPage}
            pageSize={10}
            onPageChange={setPortPage}
            isLoading={portsLoading}
          />
        </CardContent>
      </Card>

      {/* Probed Hosts */}
      <Card>
        <CardHeader>
          <CardTitle>Probed Hosts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={probedColumns}
            data={probedData?.data ?? []}
            total={probedData?.pagination?.total ?? 0}
            page={probedPage}
            pageSize={10}
            onPageChange={setProbedPage}
            isLoading={probedLoading}
          />
        </CardContent>
      </Card>

      {/* Vulnerabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={vulnColumns}
            data={vulnsData?.data ?? []}
            total={vulnsData?.pagination?.total ?? 0}
            page={vulnPage}
            pageSize={10}
            onPageChange={setVulnPage}
            isLoading={vulnsLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
