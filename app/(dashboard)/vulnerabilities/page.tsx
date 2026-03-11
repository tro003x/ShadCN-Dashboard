"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Vulnerability, Severity } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  info: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const columns: ColumnDef<Vulnerability>[] = [
  { accessorKey: "name", header: "Vulnerability" },
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
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "port",
    header: "Port",
    cell: ({ row }) => row.original.port ?? "—",
  },
  {
    accessorKey: "template_id",
    header: "Template",
    cell: ({ row }) => row.original.template_id ?? "—",
  },
  {
    accessorKey: "created_at",
    header: "Detected",
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
  },
];

const SEVERITIES: { value: Severity | ""; label: string }[] = [
  { value: "", label: "All Severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "info", label: "Info" },
];

export default function VulnerabilitiesPage() {
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<Severity | "">("");
  const [port, setPort] = useState("");
  const [portInput, setPortInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["vulns", page, severity, port],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (severity) params.set("severity", severity);
      if (port) params.set("port", port);
      const res = await api.get(`/api/vulns?${params}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vulnerabilities</h1>
          <p className="text-muted-foreground">
            Security issues found during scanning
          </p>
        </div>
        <FileUploadDialog
          endpoint="/api/vulns"
          accept=".json"
          queryKey="vulns"
          description="Upload a JSON file containing vulnerability scan results."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end bg-muted/50 p-4 rounded-lg">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value as Severity | "");
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
            {SEVERITIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Port</label>
          <div className="flex gap-2">
            <Input
              placeholder="443"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              className="h-9 w-24"
            />
            <Button
              size="sm"
              onClick={() => {
                setPort(portInput);
                setPage(1);
              }}>
              Filter
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSeverity("");
            setPort("");
            setPortInput("");
            setPage(1);
          }}>
          Clear
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.pagination?.total ?? 0}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
