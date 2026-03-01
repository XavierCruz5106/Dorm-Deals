"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"

function toDirectGoogleDriveUrl(url: URL) {
  // Convert share links like /file/d/<id>/view to a direct image URL.
  const match = url.pathname.match(/\/file\/d\/([^/]+)/)
  if (!match?.[1]) return url.toString()
  return `https://drive.google.com/uc?export=view&id=${match[1]}`
}

function normalizeImageUrl(input: string | null | undefined) {
  const raw = (input || "").trim()
  if (!raw) return null

  const withProtocol =
    raw.startsWith("//") ? `https:${raw}` : raw.startsWith("www.") ? `https://${raw}` : raw

  let parsed: URL
  try {
    parsed = new URL(withProtocol)
  } catch {
    return null
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null
  }

  const directUrl =
    parsed.hostname === "drive.google.com" && parsed.pathname.includes("/file/d/")
      ? toDirectGoogleDriveUrl(parsed)
      : parsed.toString()

  // Route all remote images through a same-origin proxy to avoid source hotlink/referrer blocks.
  return `/api/image-proxy?url=${encodeURIComponent(directUrl)}`
}

type ItemImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackClassName?: string
}

export function ItemImage({ src, alt, className, fallbackClassName }: ItemImageProps) {
  const normalizedSrc = useMemo(() => normalizeImageUrl(src), [src])
  const [broken, setBroken] = useState(false)

  if (!normalizedSrc || broken) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center", fallbackClassName)}>
        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  )
}
