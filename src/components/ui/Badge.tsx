import type { ReactNode } from 'react'

export default function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{children}</span>
}
