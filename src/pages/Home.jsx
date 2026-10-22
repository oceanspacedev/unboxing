import { useMemo } from 'react'
import PromoCarousel from '../components/PromoCarousel'
import CategoryTiles from '../components/CategoryTiles'
import ProductRow from '../components/ProductRow'
import Benefits from '../components/Benefits'
import BrandGrid from '../components/BrandGrid'
import StoreLocator from '../components/StoreLocator'
import { FEATURED } from '../data'
import { useCatalog } from '../lib/catalog'
import { useTitle } from '../lib/useTitle'

const newest = (a, b) => b.date.localeCompare(a.date) || b.id - a.id

export default function Home() {
  useTitle(null)
  const { status, products } = useCatalog()
  const loading = status === 'loading'

  const rows = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]))
    return {
      // FEATURED tampil langsung; harga & status diperbarui dari katalog begitu termuat.
      featured: FEATURED.map((f) => (byId.has(f.id) ? { ...byId.get(f.id), tag: f.tag } : f)),
      budget: products.filter((p) => p.price && p.price <= 3e6).sort(newest).slice(0, 6),
      laptops: products.filter((p) => p.category === 'Laptops').sort(newest).slice(0, 6),
    }
  }, [products])

  return (
    <>
      <PromoCarousel />
      <CategoryTiles />
      <ProductRow title="Terbaru" to="/produk" products={rows.featured} />
      <ProductRow title="Di bawah Rp3 juta" to="/produk?pmax=3000000&sort=baru" products={rows.budget} loading={loading} />
      <Benefits />
      <ProductRow title="Laptop" to="/produk?cat=Laptops" products={rows.laptops} loading={loading} />
      <BrandGrid />
      <StoreLocator />
    </>
  )
}
