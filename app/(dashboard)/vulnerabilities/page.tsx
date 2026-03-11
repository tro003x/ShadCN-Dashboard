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

const severityToggleActive: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300",
  info: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300",
};

const SEVERITY_OPTIONS: Severity[] = ["critical", "high", "medium", "low", "info"];

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
    cell: ({ row }) => row.original.port ?? "â€”",
  },
  {
    accessorKey: "template_id",
    header: "Template",
    cell: ({ row }) => row.original.template_id ?? "â€”",
  },
  {
    accessorKey: "created_at",
    header: "Detected",
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
  },
];

export default function VulnerabilitiesPage() {
  const [page, setPage] = useState(1);
  const [selectedSeverities, setSelectedSeverities] = useState<Set<Severity>>(new Set());
  const [port, setPort] = useState("");
  const [portInput, setPortInput] = useState("");

  const toggleSeverity = (s: Severity) => {
    setSelectedSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
    setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["vulns", page, [...selectedSeverities].sort().join(","), port],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (selectedSeverities.size > 0)
        params.set("severity", [...selectedSeverities].join(","));
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
      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Severity</label>
          <div className="flex flex-wrap gap-2">
            {SEVERITY_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSeverity(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedSeverities.has(s)
                    ? severityToggleActive[s]
                    : "bg-background text-muted-foreground border-input hover:bg-muted"
                }`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            {selectedSeverities.size > 0 && (
              <button
                onClick={() => { setSelectedSeverities(new Set()); setPage(1); }}
                className="px-3 py-1 rounded-full text-xs border border-input text-muted-foreground hover:bg-muted">
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
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
          {port && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPort("");
                setPortInput("");
                setPage(1);
              }}>
              Clear Port
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.pagination?.total ?? 0}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        isLoading={isLoading}
        renderSubRow={(vuln) => (
          <div className="px-4 py-3 space-y-2 text-sm bg-muted/30">
            {vuln.matcher_name && (
              <div><span className="font-medium text-muted-foreground">Matcher:</span> {vuln.matcher_name}</div>
            )}
            {vuln.template_id && (
              <div><span className="font-medium text-muted-foreground">Template ID:</span> {vuln.template_id}</div>
            )}
            {vuln.tags && vuln.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center">
                <span className="font-medium text-muted-foreground">Tags:</span>
                {vuln.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 bg-muted rounded text-xs">{tag}</span>
                ))}
              </div>
            )}
            {!vuln.matcher_name && !vuln.template_id && (!vuln.tags || vuln.tags.length === 0) && (
              <span className="text-muted-foreground">No additional details available.</span>
            )}
          </div>
        )}
      />
    </div>
  );
}
