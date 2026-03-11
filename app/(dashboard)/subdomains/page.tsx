"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Subdomain } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

const subdomainColumns: ColumnDef<Subdomain>[] = [
  { accessorKey: "id", header: "ID" },
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
];

const monitorColumns: ColumnDef<Subdomain>[] = [
  ...subdomainColumns,
];

export default function SubdomainsPage() {
  const [page, setPage] = useState(1);
  const [monitorPage, setMonitorPage] = useState(1);
  const [domainFilter, setDomainFilter] = useState("");
  const [domainInput, setDomainInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["subdomains", page, domainFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (domainFilter) params.set("domain", domainFilter);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subdomains</h1>
          <p className="text-muted-foreground">Enumerated subdomains</p>
        </div>
        <FileUploadDialog
          endpoint="/api/subdomains"
          accept=".txt"
          queryKey="subdomains"
          description="Upload a .txt file with one subdomain per line."
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Subdomains</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2 items-end bg-muted/50 p-4 rounded-lg">
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
