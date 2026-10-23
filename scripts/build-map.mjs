// Bangun peta titik Indonesia + pin toko untuk footer → src/assets/store-map.json
// dan daftar toko untuk halaman /lokasi-toko → src/assets/stores.json
//
// Usage: npm run map
//
// - Daratan: Natural Earth 1:50m (paket world-atlas), hanya wilayah Indonesia.
// - Toko: KML dari Google My Maps "Member Unboxing" yang dipakai unboxing.id.
//   Toko dikelompokkan per kota terdekat, lalu kota yang berdekatan digabung supaya
//   pin tidak bertumpuk di ukuran footer.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { feature } from 'topojson-client'
import { geoContains } from 'd3-geo'

const OUT = new URL('../src/assets/store-map.json', import.meta.url)
const STORES_OUT = new URL('../src/assets/stores.json', import.meta.url)
const KML_URL = 'https://www.google.com/maps/d/kml?mid=1lmPXV6TVFJ3C70jHFVBu2varDlUWmk8&forcekml=1'

// Batas peta & kerapatan titik (derajat).
const LON0 = 94.6
const LON1 = 141.2
const LAT0 = 6.2
const LAT1 = -11.2
const STEP = 0.55
const MIN_PIN_GAP = 1.0

// Kota acuan untuk memberi nama kelompok toko (lng, lat).
const CITIES = {
  Jakarta: [106.85, -6.21], Tangerang: [106.63, -6.18], Bekasi: [107.0, -6.24], Bogor: [106.8, -6.6],
  Karawang: [107.3, -6.31], Purwakarta: [107.44, -6.56], Subang: [107.76, -6.57], Bandung: [107.61, -6.91],
  Sumedang: [107.92, -6.86], Garut: [107.9, -7.22], Tasikmalaya: [108.22, -7.33], Ciamis: [108.35, -7.33],
  Indramayu: [108.32, -6.33], Majalengka: [108.23, -6.84], Cirebon: [108.55, -6.73], Kuningan: [108.48, -6.98],
  Brebes: [109.04, -6.87], Tegal: [109.14, -6.87], Pemalang: [109.38, -6.89], Pekalongan: [109.68, -6.89],
  Kendal: [110.2, -6.92], Semarang: [110.42, -6.99], Salatiga: [110.5, -7.33], Purwokerto: [109.24, -7.42],
  Cilacap: [109.01, -7.73], Banjarnegara: [109.69, -7.39], Kebumen: [109.65, -7.67], Purworejo: [110.0, -7.71],
  Wonosobo: [109.9, -7.36], Magelang: [110.22, -7.47],
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

// ---------- Daratan → titik ----------
const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-50m.json', import.meta.url), 'utf8'))
const indonesia = feature(topo, topo.objects.countries).features.find((f) => f.properties.name === 'Indonesia')
if (!indonesia) throw new Error('Indonesia tidak ditemukan di world-atlas')

const cols = Math.round((LON1 - LON0) / STEP)
const rows = Math.round((LAT0 - LAT1) / STEP)
const dots = []
for (let r = 0; r <= rows; r++) {
  for (let c = 0; c <= cols; c++) {
    const lon = LON0 + c * STEP
    const lat = LAT0 - r * STEP
    // Cek tengah sel + 4 titik di sekitarnya supaya pulau kecil tidak hilang.
    const q = STEP / 3
    const samples = [[lon, lat], [lon - q, lat - q], [lon + q, lat - q], [lon - q, lat + q], [lon + q, lat + q]]
    if (samples.some((p) => geoContains(indonesia, p))) dots.push([c, r])
  }
}

// ---------- Toko ----------
const tag = (block, name) => (new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(block)?.[1] ?? '').trim()
const decodeXml = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
const nearestCity = (lngLat) => Object.entries(CITIES).reduce((best, cur) => (dist(cur[1], lngLat) < dist(best[1], lngLat) ? cur : best))[0]

const kml = await (await fetch(KML_URL)).text()
const seen = new Set()
let duplicates = 0
const storeList = []
for (const [, folder] of kml.matchAll(/<Folder>([\s\S]*?)<\/Folder>/g)) {
  const group = decodeXml(tag(folder, 'name'))
  for (const [, pm] of folder.matchAll(/<Placemark>([\s\S]*?)<\/Placemark>/g)) {
    const c = /<coordinates>\s*([-\d.]+),([-\d.]+)/.exec(pm)
    if (!c) continue
    const name = decodeXml(tag(pm, 'name'))
    const lng = Number(c[1])
    const lat = Number(c[2])
    // Peta asli memuat sejumlah toko dua kali (nama & titik sama persis).
    const key = `${name.toLowerCase()}|${lng.toFixed(4)},${lat.toFixed(4)}`
    if (seen.has(key)) { duplicates++; continue }
    seen.add(key)
    storeList.push({ name, group, city: nearestCity([lng, lat]), lat: +lat.toFixed(6), lng: +lng.toFixed(6) })
  }
}
if (storeList.length < 10) throw new Error(`KML hanya berisi ${storeList.length} toko, dibatalkan`)
storeList.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name))
const stores = storeList.map((s) => [s.lng, s.lat])

// ---------- Toko → pin ----------
// 1) toko → kota terdekat
const byCity = new Map()
for (const s of storeList) {
  if (!byCity.has(s.city)) byCity.set(s.city, [])
  byCity.get(s.city).push([s.lng, s.lat])
}

// 2) gabungkan kelompok yang terlalu dekat (centroid berbobot), nama = kota dengan toko terbanyak
let groups = [...byCity].map(([city, list]) => ({
  cities: [[city, list.length]],
  count: list.length,
  at: [list.reduce((a, s) => a + s[0], 0) / list.length, list.reduce((a, s) => a + s[1], 0) / list.length],
}))
for (;;) {
  let pair = null
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const d = dist(groups[i].at, groups[j].at)
      if (d < MIN_PIN_GAP && (!pair || d < pair.d)) pair = { i, j, d }
    }
  }
  if (!pair) break
  const a = groups[pair.i]
  const b = groups[pair.j]
  const count = a.count + b.count
  const merged = {
    cities: [...a.cities, ...b.cities].sort((x, y) => y[1] - x[1]),
    count,
    at: [(a.at[0] * a.count + b.at[0] * b.count) / count, (a.at[1] * a.count + b.at[1] * b.count) / count],
  }
  groups = groups.filter((_, k) => k !== pair.i && k !== pair.j).concat(merged)
}

const toGrid = ([lon, lat]) => [+((lon - LON0) / STEP).toFixed(2), +((LAT0 - lat) / STEP).toFixed(2)]
const pins = groups
  .sort((a, b) => b.count - a.count)
  .map((g) => ({ label: g.cities[0][0], cities: g.cities.map(([c]) => c), count: g.count, xy: toGrid(g.at) }))

mkdirSync(new URL('.', OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ cols, rows, dots, pins, total: stores.length }))
writeFileSync(STORES_OUT, JSON.stringify(storeList))
console.log(`${dots.length} titik daratan, ${stores.length} toko unik (${duplicates} duplikat dibuang) → ${pins.length} pin:`)
for (const p of pins) console.log(`  ${p.label.padEnd(12)} ${String(p.count).padStart(3)} toko  (${p.cities.join(', ')})`)
