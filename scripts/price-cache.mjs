// Cache harga dipakai bersama oleh scrape-prices.mjs dan scrape-catalog.mjs,
// supaya memperbarui katalog tidak menghapus harga yang sudah diambil.
import { existsSync, readFileSync } from 'node:fs'

export const CACHE_FILE = new URL('./.cache/prices.json', import.meta.url)

export function readCache() {
  if (!existsSync(CACHE_FILE)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8'))
  } catch {
    return {}
  }
}

export function applyPrices(products, cache = readCache()) {
  return products.map((p) => {
    const c = cache[p.id]
    if (!c) return p
    return { ...p, price: c.price ?? null, status: c.status ?? null, priceCheckedAt: c.checkedAt ?? null }
  })
}
