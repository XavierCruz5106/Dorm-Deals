import { NextResponse } from "next/server"

export const runtime = "nodejs"

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"])

function getContentTypeHeader(contentType: string | null) {
  if (!contentType) return "image/jpeg"
  return contentType
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get("url")

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing image URL." }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: "Invalid image URL." }, { status: 400 })
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return NextResponse.json({ error: "Unsupported protocol." }, { status: 400 })
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch image." }, { status: 502 })
    }

    const contentType = getContentTypeHeader(upstream.headers.get("content-type"))
    const arrayBuffer = await upstream.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return NextResponse.json({ error: "Image proxy error." }, { status: 500 })
  }
}
