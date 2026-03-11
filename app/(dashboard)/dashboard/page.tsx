"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Stats, Vulnerability } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Network, Server, Monitor, ShieldAlert } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import Link from "next/link";

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  info: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const vulnColumns: ColumnDef<Vulnerability>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href="/vulnerabilities" className="hover:underline font-medium">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "host", header: "Host" },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const s = row.getValue("severity") as string;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            severityColors[s] ?? severityColors.info
          }`}>
          {s}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Detected",
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
  },
];

const chartConfig: ChartConfig = {
  count: { label: "Count", color: "var(--chart-1)" },
};

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Stats }>("/api/stats");
      return res.data.data;
    },
  });

  const { data: vulnsData, isLoading: vulnsLoading } = useQuery({
    queryKey: ["vulns", "recent"],
    queryFn: async () => {
      const res = await api.get("/api/vulns?page=1&limit=5");
      return res.data;
    },
  });

  const statCards = [
    {
      label: "Domains",
      value: statsData?.domains?.total ?? 0,
      sub: `${statsData?.domains?.scanned ?? 0} scanned`,
      icon: Globe,
      color: "text-blue-500",
    },
    {
      label: "Subdomains",
      value: statsData?.subdomains?.total ?? 0,
      icon: Network,
      color: "text-green-500",
    },
    {
      label: "Ports",
      value: statsData?.ports?.total ?? 0,
      icon: Server,
      color: "text-yellow-500",
    },
    {
      label: "Probed Hosts",
      value: statsData?.probed?.total ?? 0,
      icon: Monitor,
      color: "text-purple-500",
    },
    {
      label: "Vulnerabilities",
      value: statsData?.vulnerabilities?.total ?? 0,
      icon: ShieldAlert,
      color: "text-red-500",
    },
  ];

  const severity = statsData?.vulnerabilities?.by_severity;
  const chartData = severity
    ? [
        { name: "Critical", count: severity.critical },
        { name: "High", count: severity.high },
        { name: "Medium", count: severity.medium },
        { name: "Low", count: severity.low },
        { name: "Info", count: severity.info },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Reconnaissance overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "—" : card.value.toLocaleString()}
              </div>
              {card.sub && (
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scan Coverage + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Domain Scan Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const total = statsData?.domains?.total ?? 0;
              const scanned = statsData?.domains?.scanned ?? 0;
              const pct = total > 0 ? Math.round((scanned / total) * 100) : 0;
              return (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Scanned</span>
                    <span className="font-medium">{scanned} / {total}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{pct}% scanned</p>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <FileUploadDialog
              endpoint="/api/domains"
              accept=".txt"
              queryKey="domains"
              description="Upload a .txt file with one domain per line."
            />
            <FileUploadDialog
              endpoint="/api/subdomains"
              accept=".txt"
              queryKey="subdomains"
              description="Upload a .txt file with one subdomain per line."
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts + Recent Vulns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No vulnerability data
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={vulnColumns}
              data={vulnsData?.data ?? []}
              total={vulnsData?.data?.length ?? 0}
              isLoading={vulnsLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
