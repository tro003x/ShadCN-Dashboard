import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <ShieldAlert className="h-16 w-16 text-muted-foreground" />
      <div className="space-y-2">
        <h1 className="text-5xl font-bold">404</h1>
        <p className="text-xl font-medium">Page not found</p>
        <p className="text-muted-foreground max-w-sm">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
