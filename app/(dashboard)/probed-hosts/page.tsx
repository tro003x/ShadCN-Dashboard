"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ProbedHost } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { Button } from "@/components/ui/button";

const statusBg = (code: number) => {
  if (code < 300) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (code < 400) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  if (code < 500) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
};

const columns: ColumnDef<ProbedHost>[] = [
  { accessorKey: "url", header: "URL" },
  { accessorKey: "host", header: "Host" },
  { accessorKey: "ip", header: "IP", cell: ({ row }) => row.original.ip ?? "—" },
  {
    accessorKey: "scheme",
    header: "Scheme",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.original.scheme === "https"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      }`}>
        {row.original.scheme.toUpperCase()}
      </span>
    ),
  },
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
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => row.original.title ?? "—",
  },
  {
    accessorKey: "tech",
    header: "Technologies",
    cell: ({ row }) => {
      const tech = row.original.tech;
      if (!tech || tech.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tech.slice(0, 3).map((t) => (
            <span key={t} className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">{t}</span>
          ))}
          {tech.length > 3 && (
            <span className="text-xs text-muted-foreground">+{tech.length - 3}</span>
          )}
        </div>
      );
    },
  },
];

export default function ProbedHostsPage() {
  const [page, setPage] = useState(1);
  const [statusCode, setStatusCode] = useState("");
  const [scheme, setScheme] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["probed", page, statusCode, scheme],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusCode) params.set("status_code", statusCode);
      if (scheme) params.set("scheme", scheme);
      const res = await api.get(`/api/probed?${params}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Probed Hosts</h1>
          <p className="text-muted-foreground">HTTP probing results</p>
        </div>
        <FileUploadDialog
          endpoint="/api/probed"
          accept=".json"
          queryKey="probed"
          description="Upload a JSON file containing probed hosts data."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end bg-muted/50 p-4 rounded-lg">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Status Code</label>
          <select
            value={statusCode}
            onChange={(e) => {
              setStatusCode(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All</option>
            <option value="200">200</option>
            <option value="301">301</option>
            <option value="403">403</option>
            <option value="404">404</option>
            <option value="500">500</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Scheme</label>
          <select
            value={scheme}
            onChange={(e) => {
              setScheme(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All</option>
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
          </select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStatusCode("");
            setScheme("");
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
