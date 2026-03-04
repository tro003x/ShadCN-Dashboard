"use client"

import { ColumnDef } from "@tanstack/react-table"


export type Payment = {
  id: string
  username: string
  email: string
  status: "Pending" | "Processing" | "Success" | "Failed"
  amount: number
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusStyles: Record<string, string> = {
        Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        Processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        Success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      }
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
          {status}
        </span>
      )
    },
  },
  {
    accessorKey: "amount",
     header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]