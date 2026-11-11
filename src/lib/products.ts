import type { Locale } from './language-context'

export interface Product {
  id: string
  name_en: string
  name_fr: string
  name_nl: string
  description_en: string
  description_fr: string
  description_nl: string
  price_cents: number
  stock: number
  show_when_out_of_stock: boolean
  active: boolean
  image_path: string | null
}

export type ProductInput = Omit<Product, 'id'>

export function parsePriceCents(value: string): number | null {
  if (!/^\d+([.,]\d{1,2})?$/.test(value)) return null
  const [whole, fraction = ''] = value.replace(',', '.').split('.')
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(cents) && cents <= 10000000 ? cents : null
}

export function productText(product: Product, field: 'name' | 'description', locale: Locale): string {
  return product[`${field}_${locale}`] || product[`${field}_en`]
}

export function reconcileBasket(previous: Product[], latest: Product[], basket: Record<string, number>) {
  const selected = previous.filter(product => basket[product.id] > 0)
  const changed = selected.some(product => {
    const fresh = latest.find(item => item.id === product.id)
    return !fresh || fresh.stock < basket[product.id] || fresh.price_cents !== product.price_cents
  })
  const adjusted = Object.fromEntries(Object.entries(basket).flatMap(([id, quantity]) => {
    const item = latest.find(product => product.id === id)
    return item && item.stock > 0 ? [[id, Math.min(item.stock, quantity)]] : []
  }))
  return { changed, basket: adjusted }
}

export function validateProduct(value: unknown): ProductInput | null {
  if (!value || typeof value !== 'object') return null
  const obj = value as Record<string, unknown>
  const textFields = ['name_en', 'name_fr', 'name_nl', 'description_en', 'description_fr', 'description_nl'] as const
  if (textFields.some(key => typeof obj[key] !== 'string' || (obj[key] as string).length > (key.startsWith('name_') ? 120 : 2000))) return null
  if (!(obj.name_en as string).trim()) return null
  if (!Number.isSafeInteger(obj.price_cents) || (obj.price_cents as number) < 0 || (obj.price_cents as number) > 10000000) return null
  if (!Number.isSafeInteger(obj.stock) || (obj.stock as number) < 0 || (obj.stock as number) > 100000) return null
  if (typeof obj.active !== 'boolean' || typeof obj.show_when_out_of_stock !== 'boolean') return null
  if (obj.image_path !== null && (typeof obj.image_path !== 'string' || !/^products\/[0-9a-f-]{36}\.webp$/.test(obj.image_path))) return null
  return {
    name_en: (obj.name_en as string).trim(), name_fr: (obj.name_fr as string).trim(), name_nl: (obj.name_nl as string).trim(),
    description_en: (obj.description_en as string).trim(), description_fr: (obj.description_fr as string).trim(), description_nl: (obj.description_nl as string).trim(),
    price_cents: obj.price_cents as number, stock: obj.stock as number,
    active: obj.active, show_when_out_of_stock: obj.show_when_out_of_stock, image_path: obj.image_path,
  }
}
