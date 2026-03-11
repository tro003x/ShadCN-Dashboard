"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Domain } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DomainsPage() {
  const [page, setPage] = useState(1);
  const [isScanned, setIsScanned] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editDomain, setEditDomain] = useState<Domain | null>(null);
  const [editForm, setEditForm] = useState({ name: "", is_scanned: false });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["domains", page, isScanned, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (isScanned !== "") params.set("is_scanned", isScanned);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      const res = await api.get(`/api/domains?${params}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/domains/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["domains"] }),
  });

  const editMutation = useMutation({
    mutationFn: (vars: { id: number; body: typeof editForm }) =>
      api.put(`/api/domains/${vars.id}`, vars.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      setEditDomain(null);
    },
  });

  const columns: ColumnDef<Domain>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "name",
      header: "Domain",
      cell: ({ row }) => (
        <Link
          href={`/domains/${row.original.id}`}
          className="flex items-center gap-1 hover:underline font-medium">
          {row.original.name}
          <ExternalLink className="h-3 w-3" />
        </Link>
      ),
    },
    {
      accessorKey: "is_scanned",
      header: "Scanned",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.is_scanned
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}>
          {row.original.is_scanned ? "Yes" : "No"}
        </span>
      ),
    },
    {
      accessorKey: "subdomains_count",
      header: "Subdomains",
      cell: ({ row }) =>
        row.original.subdomains_count != null
          ? row.original.subdomains_count.toLocaleString()
          : "—",
    },
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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditDomain(row.original);
              setEditForm({
                name: row.original.name,
                is_scanned: row.original.is_scanned,
              });
            }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate(row.original.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domains</h1>
          <p className="text-muted-foreground">Manage target domains</p>
        </div>
        <FileUploadDialog
          endpoint="/api/domains"
          accept=".txt"
          queryKey="domains"
          description="Upload a .txt file with one domain per line."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end bg-muted/50 p-4 rounded-lg">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Scanned
          </label>
          <select
            value={isScanned}
            onChange={(e) => {
              setIsScanned(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All</option>
            <option value="true">Scanned</option>
            <option value="false">Not Scanned</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="h-9 w-36"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="h-9 w-36"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsScanned("");
            setDateFrom("");
            setDateTo("");
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

      {/* Edit Dialog */}
      <Dialog open={!!editDomain} onOpenChange={(v) => !v && setEditDomain(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Domain</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Domain Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_scanned"
                type="checkbox"
                checked={editForm.is_scanned}
                onChange={(e) =>
                  setEditForm({ ...editForm, is_scanned: e.target.checked })
                }
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="is_scanned">Marked as scanned</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDomain(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                editMutation.mutate({ id: editDomain!.id, body: editForm })
              }
              disabled={editMutation.isPending}>
              {editMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
