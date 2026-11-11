import { notFound } from 'next/navigation'
import ProductShop from '@/components/ProductShop'

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!['en', 'fr', 'nl'].includes(locale)) notFound()
  return <ProductShop />
}
