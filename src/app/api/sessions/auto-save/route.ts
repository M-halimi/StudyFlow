import { NextRequest, NextResponse } from "next/server"
import { autoSaveSession } from "@/features/sessions/actions/session-actions"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, remainingTime } = body
    if (!id || typeof remainingTime !== "number") {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    await autoSaveSession(id, remainingTime)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
