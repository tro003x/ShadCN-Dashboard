"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Port } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const columns: ColumnDef<Port>[] = [
  { accessorKey: "host", header: "Host" },
  { accessorKey: "ip", header: "IP" },
  { accessorKey: "port", header: "Port" },
  { accessorKey: "protocol", header: "Protocol" },
  {
    accessorKey: "tls",
    header: "TLS",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.tls
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        }`}>
        {row.original.tls ? "TLS" : "Plain"}
      </span>
    ),
  },
  {
    accessorKey: "subdomain",
    header: "Subdomain",
    cell: ({ row }) => row.original.subdomain ?? "—",
  },
];

export default function PortsPage() {
  const [page, setPage] = useState(1);
  const [ipFilter, setIpFilter] = useState("");
  const [portFilter, setPortFilter] = useState("");
  const [subdomainFilter, setSubdomainFilter] = useState("");
  const [applied, setApplied] = useState({ ip: "", port: "", subdomain: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["ports", page, applied],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (applied.ip) params.set("ip", applied.ip);
      if (applied.port) params.set("port", applied.port);
      if (applied.subdomain) params.set("subdomain", applied.subdomain);
      const res = await api.get(`/api/ports?${params}`);
      return res.data;
    },
  });

  const applyFilters = () => {
    setApplied({ ip: ipFilter, port: portFilter, subdomain: subdomainFilter });
    setPage(1);
  };

  const clearFilters = () => {
    setIpFilter("");
    setPortFilter("");
    setSubdomainFilter("");
    setApplied({ ip: "", port: "", subdomain: "" });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ports</h1>
          <p className="text-muted-foreground">Open ports discovered during scanning</p>
        </div>
        <FileUploadDialog
          endpoint="/api/ports"
          accept=".csv"
          queryKey="ports"
          description="Upload a CSV file with format: host,ip,port,protocol,tls"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end bg-muted/50 p-4 rounded-lg">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">IP Address</label>
          <Input
            placeholder="192.168.1.1"
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            className="h-9 w-36"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Port</label>
          <Input
            placeholder="80"
            value={portFilter}
            onChange={(e) => setPortFilter(e.target.value)}
            className="h-9 w-24"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Subdomain</label>
          <Input
            placeholder="sub.example.com"
            value={subdomainFilter}
            onChange={(e) => setSubdomainFilter(e.target.value)}
            className="h-9 w-48"
          />
        </div>
        <Button size="sm" onClick={applyFilters}>Filter</Button>
        <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
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
