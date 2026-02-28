import { NextResponse } from "next/server";

export async function GET() {
  const users = [
    { id: 1, name: "Rahim", role: "Admin" },
    { id: 2, name: "Karim", role: "User" },
    { id: 3, name: "Anika", role: "Editor" },
  ];

  return NextResponse.json(users);
}