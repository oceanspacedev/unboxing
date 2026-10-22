// Snapshot katalog unboxing.id -> products.json
// Usage: npm run scrape   (menulis ke public/data/products.json)
// Sumber: REST API WordPress (brand, kategori, tanggal) + halaman /semua-produk/ (spesifikasi ringkas).
import * as cheerio from 'cheerio'
import { writeFileSync } from 'node:fs'
import { applyPrices } from './price-cache.mjs'

const BASE = 'https://unboxing.id'
const OUT = process.argv[2] ?? new URL('../public/data/products.json', import.meta.url)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(url, json = false) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 unboxing-web-redesign' } })
      if (!r.ok) throw new Error(r.status)
      return { body: json ? await r.json() : await r.text(), headers: r.headers }
    } catch (e) {
      if (i === 2) throw new Error(`${url}: ${e.message}`)
      await sleep(1000 * (i + 1))
    }
  }
}

async function pool(items, n, fn) {
  const out = []
  let idx = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (idx < items.length) {
      const i = idx++
      out[i] = await fn(items[i], i)
      await sleep(150)
    }
  }))
  return out
}

const decode = (s) => cheerio.load(`<p>${s}</p>`)('p').text()

// 1) Taxonomies
const brands = Object.fromEntries((await get(`${BASE}/wp-json/wp/v2/aps-brands?per_page=100&_fields=id,name`, true)).body.map((b) => [b.id, b.name]))
const cats = Object.fromEntries((await get(`${BASE}/wp-json/wp/v2/aps-cats?per_page=100&_fields=id,name`, true)).body.map((c) => [c.id, c.name]))

// 2) REST products (brand, category, date)
const fields = 'id,slug,date,title,link,aps-brands,aps-cats,yoast_head_json.og_image'
const first = await get(`${BASE}/wp-json/wp/v2/aps-products?per_page=100&page=1&_fields=${fields}`, true)
const totalPages = Number(first.headers.get('x-wp-totalpages'))
const rest = [first.body]
for (let p = 2; p <= totalPages; p++) {
  rest.push((await get(`${BASE}/wp-json/wp/v2/aps-products?per_page=100&page=${p}&_fields=${fields}`, true)).body)
  console.error(`rest ${p}/${totalPages}`)
  await sleep(200)
}
const restItems = rest.flat()

// 3) Listing pages (key specs + thumbnail)
const firstList = cheerio.load((await get(`${BASE}/semua-produk/`)).body)
const lastPage = Math.max(1, ...firstList('a.page-numbers').map((_, a) => Number(firstList(a).text())).get().filter(Boolean))
const pages = Array.from({ length: lastPage }, (_, i) => i + 1)
const listing = {}
await pool(pages, 4, async (p) => {
  const $ = p === 1 ? firstList : cheerio.load((await get(`${BASE}/semua-produk/page/${p}/`)).body)
  $('li[id^="product-"]').each((_, li) => {
    const id = Number($(li).attr('id').replace('product-', ''))
    const specs = {}
    $(li).find('li').each((_, s) => {
      const k = $(s).find('strong').text().replace(':', '').trim()
      if (k) specs[k] = $(s).text().replace($(s).find('strong').text(), '').trim()
    })
    listing[id] = { img: $(li).find('.aps-product-thumb img').attr('src'), specs }
  })
  if (p % 10 === 0) console.error(`list ${p}/${lastPage}`)
})

// 4) Merge
// Tag brand di unboxing.id kadang salah (mis. Huawei ditag Apple, Motorola ditag ZTE),
// jadi kata pertama nama produk lebih dipercaya bila dikenali.
const BRAND_BY_FIRST_WORD = {
  apple: 'Apple', iphone: 'Apple', ipad: 'Apple', macbook: 'Apple',
  samsung: 'Samsung', galaxy: 'Samsung',
  xiaomi: 'Xiaomi', redmi: 'Xiaomi', poco: 'Xiaomi', mi: 'Xiaomi',
  oppo: 'Oppo', reno: 'Oppo', realme: 'Realme', narzo: 'Realme',
  vivo: 'Vivo', iqoo: 'Vivo', huawei: 'Huawei', matebook: 'Huawei', honor: 'Honor',
  infinix: 'Infinix', tecno: 'Tecno', itel: 'Itel', motorola: 'Motorola',
  nokia: 'Nokia', zte: 'ZTE', nubia: 'ZTE', mito: 'Mito', advan: 'Advan',
  asus: 'ASUS', acer: 'Acer', lenovo: 'Lenovo', hp: 'HP', msi: 'MSI', hotwav: 'Hotwav',
}
// Banyak aksesoris (TWS, smartwatch, band) ditag "Mobiles" di situs asli. Bundel HP + TWS
// (nama berisi kapasitas seperti "8GB/256GB") tetap dianggap HP.
const ACCESSORY = /(buds?|pods)\b|\b(earphones?|headphones?|headset|tws|watch\d*|band|soundbar|speaker|charger|power ?bank|cable|kabel)\b/i
const HAS_CAPACITY = /\d+\s*(gb|tb)\b|\d+\/\d+/i
const categorize = (name, tagged) => (ACCESSORY.test(name) && !HAS_CAPACITY.test(name) ? 'Aksesoris' : tagged)

const products = restItems.filter((p) => decode(p.title.rendered).trim()).map((p) => {
  const title = decode(p.title.rendered).trim()
  const l = listing[p.id] || { specs: {} }
  const tagged = brands[p['aps-brands']?.[0]] || 'Lainnya'
  const brand = BRAND_BY_FIRST_WORD[title.split(/\s+/)[0].toLowerCase()] ?? tagged
  return {
    id: p.id,
    slug: p.slug,
    name: title,
    brand,
    category: categorize(title, cats[p['aps-cats']?.[0]] || 'Lainnya'),
    date: p.date.slice(0, 10),
    url: p.link,
    img: l.img || p.yoast_head_json?.og_image?.[0]?.url || null,
    specs: l.specs,
  }
})

// Harga diambil terpisah (npm run scrape:prices); pertahankan yang sudah ada di cache.
writeFileSync(OUT, JSON.stringify(applyPrices(products)))
console.error(`done: ${products.length} products, ${Object.keys(listing).length} with listing specs`)
