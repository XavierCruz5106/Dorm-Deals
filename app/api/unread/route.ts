import { NextResponse } from "next/server"
import { getUnreadCount } from "@/app/actions"

export async function GET() {
  const count = await getUnreadCount()
  return NextResponse.json({ count })
}