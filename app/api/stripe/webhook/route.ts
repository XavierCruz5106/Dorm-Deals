import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({
    received: true,
    mode: "simulated",
    message: "Webhook processing is not required in simulated payments mode.",
  })
}
