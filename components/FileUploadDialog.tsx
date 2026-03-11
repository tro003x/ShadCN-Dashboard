"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";

interface FileUploadDialogProps {
  endpoint: string;
  accept: string;
  queryKey: string;
  description?: string;
  fieldName?: string;
  extraFields?: Record<string, string>;
}

export function FileUploadDialog({
  endpoint,
  accept,
  queryKey,
  description = "Upload a file to import data.",
  fieldName = "file",
  extraFields,
}: FileUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClientLocal = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const formData = new FormData();
      formData.append(fieldName, file);
      if (extraFields) {
        Object.entries(extraFields).forEach(([k, v]) =>
          formData.append(k, v)
        );
      }
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClientLocal.invalidateQueries({ queryKey: [queryKey] });
      setOpen(false);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setFile(null);
          mutation.reset();
        }
      }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import File
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
          />
          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as Error)?.message ??
                "Upload failed. Please try again."}
            </p>
          )}
          {mutation.isSuccess && (
            <p className="text-sm text-green-600">
              Data imported successfully!
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setFile(null);
              mutation.reset();
            }}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!file || mutation.isPending}>
            {mutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
