'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'

export default function ProductImage({ path, name, className = '' }: { path: string | null; name: string; className?: string }) {
  const [failedPath, setFailedPath] = useState<string | null>(null)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!path || !url || failedPath === path) {
    return <div aria-label={name} role="img" className={`flex items-center justify-center bg-gradient-to-br from-stone-800 to-zinc-950 text-accent/50 ${className}`}><Package size={44} strokeWidth={1} aria-hidden="true" /></div>
  }
  return <img src={`${url}/storage/v1/object/public/product-photos/${path}`} alt={name} loading="lazy" decoding="async" onError={() => setFailedPath(path)} className={`bg-zinc-900 object-contain ${className}`} />
}
