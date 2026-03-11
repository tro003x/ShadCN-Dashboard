"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Subdomain } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

// Monitor columns (include optional probed host fields from API response)
const monitorColumns: ColumnDef<Subdomain & { url?: string; status_code?: number; title?: string }>[] = [
  {
    accessorKey: "name",
    header: "Subdomain",
    cell: ({ row }) => (
      <Link
        href={`/subdomains/${row.original.id}`}
        className="flex items-center gap-1 hover:underline font-medium">
        {row.original.name}
        <ExternalLink className="h-3 w-3" />
      </Link>
    ),
  },
  { accessorKey: "domain", header: "Domain" },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => (row.original as unknown as Record<string, string>).url ?? "—",
  },
  {
    accessorKey: "status_code",
    header: "Status",
    cell: ({ row }) => {
      const code = (row.original as unknown as Record<string, number | undefined>).status_code;
      if (!code) return "—";
      const cls =
        code < 300 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
        code < 400 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
        code < 500 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{code}</span>;
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (row.original as unknown as Record<string, string>).title ?? "—",
  },
];

export default function SubdomainsPage() {
  const [page, setPage] = useState(1);
  const [monitorPage, setMonitorPage] = useState(1);
  const [domainFilter, setDomainFilter] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [uploadDomainId, setUploadDomainId] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["subdomains", page, domainFilter, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (domainFilter) params.set("domain", domainFilter);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      const res = await api.get(`/api/subdomains?${params}`);
      return res.data;
    },
  });

  const { data: monitorData, isLoading: monitorLoading } = useQuery({
    queryKey: ["subdomains-monitor", monitorPage],
    queryFn: async () => {
      const res = await api.get(
        `/api/subdomains/monitor?page=${monitorPage}&limit=10`
      );
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/subdomains/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subdomains"] }),
  });

  const subdomainColumns: ColumnDef<Subdomain>[] = [
    {
      accessorKey: "name",
      header: "Subdomain",
      cell: ({ row }) => (
        <Link
          href={`/subdomains/${row.original.id}`}
          className="flex items-center gap-1 hover:underline font-medium">
          {row.original.name}
          <ExternalLink className="h-3 w-3" />
        </Link>
      ),
    },
    { accessorKey: "domain", header: "Domain" },
    {
      accessorKey: "created_at",
      header: "Added",
      cell: ({ row }) =>
        new Date(row.getValue("created_at")).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteMutation.mutate(row.original.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subdomains</h1>
          <p className="text-muted-foreground">Enumerated subdomains</p>
        </div>
        <div className="flex items-center gap-2">
          <FileUploadDialog
            endpoint="/api/subdomains"
            accept=".txt"
            queryKey="subdomains"
            description="Upload a .txt file with one subdomain per line."
            extraFields={uploadDomainId ? { domain_id: uploadDomainId } : undefined}
          />
        </div>
      </div>

      {/* Domain ID for upload */}
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Domain ID (for upload)</label>
          <Input
            type="number"
            placeholder="e.g. 1"
            value={uploadDomainId}
            onChange={(e) => setUploadDomainId(e.target.value)}
            className="h-9 w-28"
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Subdomains</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-end bg-muted/50 p-4 rounded-lg">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Filter by Domain
              </label>
              <Input
                placeholder="example.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="h-9 w-52"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="h-9 w-36"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="h-9 w-36"
              />
            </div>
            <Button
              size="sm"
              onClick={() => {
                setDomainFilter(domainInput);
                setPage(1);
              }}>
              Filter
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDomainInput("");
                setDomainFilter("");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}>
              Clear
            </Button>
          </div>

          <DataTable
            columns={subdomainColumns}
            data={data?.data ?? []}
            total={data?.pagination?.total ?? 0}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Active subdomains with associated probed hosts.
          </p>
          <DataTable
            columns={monitorColumns}
            data={monitorData?.data ?? []}
            total={monitorData?.pagination?.total ?? 0}
            page={monitorPage}
            pageSize={10}
            onPageChange={setMonitorPage}
            isLoading={monitorLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
