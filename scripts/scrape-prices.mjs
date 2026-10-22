// Ambil harga & status dari halaman detail tiap produk di unboxing.id,
// lalu gabungkan ke public/data/products.json.
//
// Usage: npm run scrape:prices              (lanjutkan: lewati produk yang sudah ada di cache)
//        npm run scrape:prices -- --refresh (ambil ulang semuanya)
//
// Sengaja pelan (2 request paralel + jeda) supaya tidak membebani server unboxing.id.
// Progres disimpan di scripts/.cache/prices.json, jadi aman dihentikan lalu dijalankan lagi.
import * as cheerio from 'cheerio'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { applyPrices, CACHE_FILE, readCache } from './price-cache.mjs'

const CATALOG = new URL('../public/data/products.json', import.meta.url)
const CONCURRENCY = 2
const DELAY_MS = 700
const SAVE_EVERY = 20

const refresh = process.argv.includes('--refresh')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// "Rp 9.299.000" / "2.999.000" / "7099000" / "Rp 1.299.000,00" → angka rupiah.
// Di bawah Rp10.000 dianggap tidak valid (lihat catatan di extract()).
const MIN_PRICE = 10_000
export function parseRupiah(text) {
  const m = /(\d[\d.,]*)/.exec((text ?? '').replace(/,00\b/, ''))
  if (!m) return null
  // Hanya angka polos ("7099000") atau berkelompok tiga ("2.999.000").
  // Format lain seperti "229.99" (sisa data USD lama) ditolak, bukan ditebak.
  if (!/^\d+$/.test(m[1]) && !/^\d{1,3}([.,]\d{3})+$/.test(m[1])) return null
  const n = Number(m[1].replace(/[.,]/g, ''))
  return Number.isFinite(n) && n >= MIN_PRICE ? n : null
}

export function extract(html) {
  const $ = cheerio.load(html)
  const attr = (name) =>
    $('.aps-attr-title')
      .filter((_, e) => $(e).text().replace(/\s+/g, ' ').trim().toLowerCase().startsWith(name))
      .first()
      .closest('tr, li')
      .find('.aps-attr-value')
      .text()
      .replace(/\s+/g, ' ')
      .trim()

  // Urutan sumber penting: di beberapa produk harga diinput sebagai teks "2.999.000",
  // lalu tampilan situs membulatkannya jadi "Rp3". Baris spesifikasi "Price" dan
  // meta itemprop=price menyimpan angka aslinya, jadi itu dicek lebih dulu.
  const candidates = [
    attr('price'),
    $('.aps-product-meta [itemprop="price"]').first().attr('content'),
    $('.aps-product-meta .aps-product-price .aps-price-value').first().text().trim(),
  ].filter(Boolean)
  const priceText = candidates.find((t) => parseRupiah(t)) ?? candidates[0] ?? null
  return {
    price: parseRupiah(priceText),
    priceText,
    status: attr('status') || null,
  }
}

// 429/502/503/504 = server sibuk → mundur bertahap. 500 biasanya error permanen di
// halaman itu sendiri (mis. beberapa produk Honor), jadi cukup dicoba ulang sekali.
const BUSY = new Set([429, 502, 503, 504])

async function fetchPage(url) {
  let serverErrors = 0
  for (let attempt = 0; attempt < 4; attempt++) {
    let status = 0
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 unboxing-web-redesign (price sync)' } })
      status = r.status
      if (r.status === 404) return null
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return await r.text()
    } catch (e) {
      if (!BUSY.has(status) && status >= 500 && ++serverErrors >= 2) break
      const wait = 5000 * (attempt + 1)
      console.error(`  ! ${url}: ${e.message}, coba lagi dalam ${wait / 1000}s`)
      await sleep(wait)
    }
  }
  throw new Error(`gagal: ${url}`)
}

async function main() {
  const products = JSON.parse(readFileSync(CATALOG, 'utf8'))
  const cache = refresh ? {} : readCache()
  const todo = products.filter((p) => !cache[p.id])
  console.error(`${products.length} produk, ${products.length - todo.length} sudah di cache, ${todo.length} akan diambil`)

  mkdirSync(new URL('.', CACHE_FILE), { recursive: true })
  const save = () => writeFileSync(CACHE_FILE, JSON.stringify(cache))

  let done = 0
  let failed = 0
  const started = Date.now()
  let next = 0

  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < todo.length) {
      const p = todo[next++]
      try {
        const html = await fetchPage(p.url)
        cache[p.id] = html ? { ...extract(html), checkedAt: new Date().toISOString().slice(0, 10) } : { price: null, priceText: null, status: 'Not found', checkedAt: new Date().toISOString().slice(0, 10) }
      } catch (e) {
        failed++
        console.error(`  x ${p.slug}: ${e.message}`)
      }
      done++
      if (done % SAVE_EVERY === 0 || done === todo.length) {
        save()
        const rate = (Date.now() - started) / done
        const eta = Math.round(((todo.length - done) * rate) / 60000)
        console.error(`${done}/${todo.length} (gagal ${failed}) ~${eta} menit lagi`)
      }
      await sleep(DELAY_MS)
    }
  }))

  save()
  const merged = applyPrices(products, cache)
  writeFileSync(CATALOG, JSON.stringify(merged))
  const withPrice = merged.filter((p) => p.price).length
  console.error(`selesai: ${withPrice}/${merged.length} produk punya harga, ${failed} gagal (jalankan lagi untuk mencoba ulang)`)
}

// Hanya jalan bila dipanggil langsung (bukan saat di-import untuk tes).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
