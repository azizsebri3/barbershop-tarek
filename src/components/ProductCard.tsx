'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { Eye, Plus, X } from 'lucide-react'
import ProductImage from './ProductImage'
import type { Product } from '@/lib/products'

interface CardLabels {
  add: string
  soldOut: string
  inStock: string
  quickView: string
  close: string
}

export default function ProductCard({ product, name, description, price, quantity, labels, onAdd }: {
  product: Product; name: string; description: string; price: string; quantity: number
  labels: CardLabels; onAdd: () => void
}) {
  const reducedMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(x, { stiffness: 220, damping: 22 })
  const rotateY = useSpring(y, { stiffness: 220, damping: 22 })
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const disabled = product.stock === 0 || quantity >= product.stock

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <>
      <div className="[perspective:1000px]">
        <motion.article
          style={{ rotateX, rotateY }}
          onMouseMove={event => {
            if (reducedMotion) return
            const rect = event.currentTarget.getBoundingClientRect()
            x.set(-((event.clientY - rect.top) / rect.height - 0.5) * 7)
            y.set(((event.clientX - rect.left) / rect.width - 0.5) * 7)
          }}
          onMouseLeave={() => { x.set(0); y.set(0) }}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-xl shadow-black/20 transition-colors hover:border-accent/50 hover:shadow-accent/10"
        >
          <div className="relative overflow-hidden">
            <ProductImage path={product.image_path} name={name} className="aspect-square w-full transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />
            <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${product.stock ? 'bg-emerald-950/85 text-emerald-200' : 'bg-red-950/85 text-red-200'}`}>{product.stock ? labels.inStock : labels.soldOut}</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            <h2 className="text-lg font-semibold text-white">{name}</h2>
            <p className="line-clamp-3 flex-1 whitespace-pre-wrap text-sm text-zinc-400">{description}</p>
            <p className="text-lg font-bold text-accent">{price}</p>
            <div className="flex gap-2">
              <button type="button" onClick={onAdd} disabled={disabled} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-bold text-black transition hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"><Plus size={16} aria-hidden="true" />{product.stock ? labels.add : labels.soldOut}</button>
              <button type="button" onClick={() => setOpen(true)} aria-label={`${labels.quickView}: ${name}`} className="rounded-xl border border-white/15 px-3 text-white transition hover:border-accent hover:text-accent"><Eye size={18} aria-hidden="true" /></button>
            </div>
          </div>
        </motion.article>
      </div>
      <dialog ref={dialog} onClose={() => setOpen(false)} aria-labelledby={`product-${product.id}`} className="m-auto max-h-[90dvh] w-[min(90vw,640px)] overflow-y-auto rounded-2xl border border-white/15 bg-zinc-900 p-0 text-white shadow-2xl backdrop:bg-black/80">
        <div className="relative grid sm:grid-cols-2">
          <ProductImage path={product.image_path} name={name} className="aspect-square w-full" />
          <div className="space-y-4 p-6">
            <button type="button" onClick={() => setOpen(false)} aria-label={labels.close} className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white"><X size={20} /></button>
            <p className="text-sm text-accent">{product.stock ? labels.inStock : labels.soldOut}</p>
            <h2 id={`product-${product.id}`} className="text-2xl font-bold">{name}</h2>
            <p className="whitespace-pre-wrap text-sm text-zinc-300">{description}</p>
            <p className="text-xl font-bold text-accent">{price}</p>
            <button type="button" onClick={onAdd} disabled={disabled} className="min-h-11 w-full rounded-xl bg-accent px-4 font-bold text-black disabled:opacity-40">{product.stock ? labels.add : labels.soldOut}</button>
          </div>
        </div>
      </dialog>
    </>
  )
}
