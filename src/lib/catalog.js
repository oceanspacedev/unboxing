import { useEffect, useState } from 'react'

const CATALOG_URL = `${import.meta.env.BASE_URL}data/products.json`

let request = null

// Satu fetch untuk seluruh aplikasi; gagal → boleh dicoba lagi.
export function loadCatalog() {
  request ??= fetch(CATALOG_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .catch((e) => {
      request = null
      throw e
    })
  return request
}

export function useCatalog() {
  const [state, setState] = useState({ status: 'loading', products: [] })

  useEffect(() => {
    let active = true
    loadCatalog()
      .then((products) => active && setState({ status: 'ready', products }))
      .catch((error) => active && setState({ status: 'error', products: [], error }))
    return () => { active = false }
  }, [])

  return state
}

export const CATEGORY_LABEL = {
  Mobiles: 'Smartphone',
  Tablet: 'Tablet',
  Laptops: 'Laptop',
  Aksesoris: 'Aksesoris',
}

export const categoryLabel = (c) => CATEGORY_LABEL[c] ?? c

// "256 GB UFS 2.2" → 256, "1 TB NVMe" → 1024, "512 MB" → 0.5
export function toGB(value) {
  const m = /([\d.,]+)\s*(TB|GB|MB)/i.exec(value ?? '')
  if (!m) return null
  const n = parseFloat(m[1].replace(',', '.'))
  const unit = m[2].toUpperCase()
  return unit === 'TB' ? n * 1024 : unit === 'MB' ? n / 1024 : n
}

export const ramOf = (p) => toGB(p.specs.RAM)
export const storageOf = (p) => toGB(p.specs.Storage)

// Baris spesifikasi untuk kartu, detail, dan tabel perbandingan.
// CPU (HP) dan Processor (laptop) digabung jadi satu baris.
export const SPEC_ROWS = [
  { label: 'Prosesor', get: (s) => s.CPU || s.Processor },
  { label: 'RAM', get: (s) => s.RAM, best: (p) => ramOf(p) },
  { label: 'Penyimpanan', get: (s) => s.Storage, best: (p) => storageOf(p) },
  { label: 'Layar', get: (s) => s.Display },
  { label: 'Kamera', get: (s) => s.Camera },
  { label: 'Webcam', get: (s) => s['Web Cam'] },
  { label: 'Sistem Operasi', get: (s) => s.OS },
  { label: 'Baterai', get: (s) => s.Battery },
  { label: 'Pengisian Daya', get: (s) => s.Charging },
  { label: 'Waktu Pakai', get: (s) => s.Playtime },
  { label: 'Bluetooth', get: (s) => s.Bluetooth },
]

const clean = (v) => {
  const t = v?.trim()
  // "-", "N/A", "N/A, N/A" = tidak ada data
  return t && t !== '-' && !/^(n\/?a[\s,]*)+$/i.test(t) ? t : null
}

export function specRows(product) {
  return SPEC_ROWS.map((r) => ({ label: r.label, value: clean(r.get(product.specs)) })).filter((r) => r.value)
}

export function shortSpecs(product) {
  return [product.specs.RAM && `RAM ${product.specs.RAM}`, product.specs.Storage?.split(' ').slice(0, 2).join(' ')]
    .filter(Boolean)
}

// Ringkasan 4 spesifikasi utama untuk halaman detail ("pOLED · 120Hz", "50 MP", …).
export function keySpecs(product) {
  const s = product.specs
  const firstPart = (v) => clean(v)?.split(/,|\(/)[0].trim()
  const memory = [firstPart(s.RAM), clean(s.Storage)?.split(' ').slice(0, 2).join(' ')].filter(Boolean).join(' · ')
  const display = clean(s.Display) && [firstPart(s.Display), /\d+\s?Hz/i.exec(s.Display)?.[0]].filter(Boolean).join(' · ')
  // "Intel® Core™ i5-11400H Processor 2.7 GHz (…)" → "Intel Core i5-11400H"
  const processor = clean(s.Processor)?.replace(/[®™?]/g, '').replace(/\s*processor\b.*$/i, '').split('(')[0].trim()

  return [
    { key: 'cpu', label: 'Prosesor', value: firstPart(s.CPU) || processor },
    { key: 'display', label: 'Layar', value: display },
    { key: 'camera', label: 'Kamera', value: /\d+(\.\d+)?\s?MP/i.exec(s.Camera ?? '')?.[0] },
    { key: 'memory', label: 'Memori', value: memory },
    { key: 'os', label: 'Sistem', value: firstPart(s.OS) },
  ].filter((k) => k.value).slice(0, 4)
}

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

// 9299000 → "Rp 9.299.000"
export const formatRupiah = (n) => (n ? rupiah.format(n).replace(/ /g, ' ') : null)

// 2500000 → "2,5 jt"
export const formatJuta = (n) => `${(n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`

// Status "Available" tidak perlu ditampilkan; sisanya (Coming Soon, Discontinued, …) jadi label.
const STATUS_LABEL = { 'coming soon': 'Segera Hadir', 'rumored': 'Segera Hadir', 'discontinued': 'Tidak Dijual', 'cancelled': 'Tidak Dijual' }
export function statusLabel(status) {
  const s = (status ?? '').trim().toLowerCase()
  if (!s || s === 'available') return null
  return STATUS_LABEL[s] ?? null
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
