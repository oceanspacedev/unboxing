import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { categoryLabel, formatJuta, ramOf, storageOf, useCatalog } from '../lib/catalog'
import { useTitle } from '../lib/useTitle'

const PAGE_SIZE = 24

const RAM_BUCKETS = [
  { id: '4', label: '≤ 4 GB', test: (g) => g <= 4 },
  { id: '6', label: '6 GB', test: (g) => g > 4 && g <= 6 },
  { id: '8', label: '8 GB', test: (g) => g > 6 && g <= 8 },
  { id: '12', label: '12 GB', test: (g) => g > 8 && g <= 12 },
  { id: '16', label: '16 GB+', test: (g) => g > 12 },
]

const STORAGE_BUCKETS = [
  { id: '64', label: '≤ 64 GB', test: (g) => g <= 64 },
  { id: '128', label: '128 GB', test: (g) => g > 64 && g <= 128 },
  { id: '256', label: '256 GB', test: (g) => g > 128 && g <= 256 },
  { id: '512', label: '512 GB', test: (g) => g > 256 && g <= 512 },
  { id: '1024', label: '1 TB+', test: (g) => g > 512 },
]

const PRICE_PRESETS = [
  { id: 'a', min: null, max: 2e6 },
  { id: 'b', min: 2e6, max: 4e6 },
  { id: 'c', min: 4e6, max: 7e6 },
  { id: 'd', min: 7e6, max: 12e6 },
  { id: 'e', min: 12e6, max: 20e6 },
  { id: 'f', min: 20e6, max: null },
]

function rangeLabel(min, max) {
  if (min && max) return `Rp${formatJuta(min).replace(' jt', '')}–${formatJuta(max)}`
  if (min) return `≥ Rp${formatJuta(min)}`
  return `≤ Rp${formatJuta(max)}`
}

const inRange = (price, min, max) => price != null && (!min || price >= min) && (!max || price <= max)

// Produk tanpa harga selalu di akhir, apa pun arah urutannya.
const byPrice = (dir) => (a, b) => {
  if (a.price == null || b.price == null) return (a.price == null) - (b.price == null)
  return dir * (a.price - b.price)
}

const SORTS = {
  baru: { label: 'Terbaru', fn: (a, b) => b.date.localeCompare(a.date) || b.id - a.id },
  murah: { label: 'Harga termurah', fn: byPrice(1) },
  mahal: { label: 'Harga termahal', fn: byPrice(-1) },
  lama: { label: 'Terlama', fn: (a, b) => a.date.localeCompare(b.date) || a.id - b.id },
  az: { label: 'Nama A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
  za: { label: 'Nama Z–A', fn: (a, b) => b.name.localeCompare(a.name) },
  ram: { label: 'RAM terbesar', fn: (a, b) => (ramOf(b) ?? 0) - (ramOf(a) ?? 0) },
  storage: { label: 'Penyimpanan terbesar', fn: (a, b) => (storageOf(b) ?? 0) - (storageOf(a) ?? 0) },
}

const list = (v) => (v ? v.split(',').filter(Boolean) : [])

function readFilters(params) {
  return {
    q: params.get('q') ?? '',
    cat: params.get('cat') ?? '',
    brand: list(params.get('brand')),
    ram: list(params.get('ram')),
    storage: list(params.get('storage')),
    pmin: Number(params.get('pmin')) || null,
    pmax: Number(params.get('pmax')) || null,
    sort: SORTS[params.get('sort')] ? params.get('sort') : 'baru',
    page: Math.max(1, Number(params.get('page')) || 1),
  }
}

function inBuckets(value, buckets, selected) {
  if (!selected.length) return true
  if (value == null) return false
  return buckets.some((b) => selected.includes(b.id) && b.test(value))
}

// Banyak produk Samsung dinamai "SAMSUNG A54" tanpa kata "Galaxy", padahal itu yang biasa diketik.
const SEARCH_ALIASES = { Samsung: 'galaxy' }

// skip = nama filter yang diabaikan, supaya hitungan facet tetap informatif.
function matches(p, f, skip) {
  if (skip !== 'q' && f.q) {
    const hay = `${p.name} ${p.brand} ${SEARCH_ALIASES[p.brand] ?? ''}`.toLowerCase()
    if (!f.q.toLowerCase().split(/\s+/).every((t) => hay.includes(t))) return false
  }
  if (skip !== 'cat' && f.cat && p.category !== f.cat) return false
  if (skip !== 'brand' && f.brand.length && !f.brand.includes(p.brand)) return false
  if (skip !== 'ram' && !inBuckets(ramOf(p), RAM_BUCKETS, f.ram)) return false
  if (skip !== 'storage' && !inBuckets(storageOf(p), STORAGE_BUCKETS, f.storage)) return false
  if (skip !== 'price' && (f.pmin || f.pmax) && !inRange(p.price, f.pmin, f.pmax)) return false
  return true
}

function countBy(products, f, skip, keyFn) {
  const counts = {}
  for (const p of products) {
    if (!matches(p, f, skip)) continue
    for (const k of [].concat(keyFn(p))) counts[k] = (counts[k] || 0) + 1
  }
  return counts
}

const bucketIds = (value, buckets) => (value == null ? [] : buckets.filter((b) => b.test(value)).map((b) => b.id))

export default function ProductList() {
  const { status, products } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)
  const f = useMemo(() => readFilters(params), [params])

  const update = (changes, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      const val = Array.isArray(v) ? v.join(',') : v
      if (val) next.set(k, val)
      else next.delete(k)
    }
    if (!keepPage) next.delete('page')
    setParams(next, { replace: !('page' in changes) })
  }

  const toggleIn = (key, id) => {
    const cur = f[key]
    update({ [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] })
  }

  const facets = useMemo(() => ({
    cat: countBy(products, f, 'cat', (p) => p.category),
    brand: countBy(products, f, 'brand', (p) => p.brand),
    ram: countBy(products, f, 'ram', (p) => bucketIds(ramOf(p), RAM_BUCKETS)),
    storage: countBy(products, f, 'storage', (p) => bucketIds(storageOf(p), STORAGE_BUCKETS)),
    price: countBy(products, f, 'price', (p) => PRICE_PRESETS.filter((r) => inRange(p.price, r.min, r.max)).map((r) => r.id)),
  }), [products, f])

  // Rentang harga produk yang lolos filter lain, untuk placeholder input.
  const priceBounds = useMemo(() => {
    const prices = products.filter((p) => p.price && matches(p, f, 'price')).map((p) => p.price)
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null
  }, [products, f])

  const results = useMemo(
    () => products.filter((p) => matches(p, f)).sort(SORTS[f.sort].fn),
    [products, f],
  )

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const page = Math.min(f.page, totalPages)
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goPage = (n) => {
    update({ page: n > 1 ? String(n) : '' }, { keepPage: true })
    document.getElementById('hasil')?.scrollIntoView({ behavior: 'smooth' })
  }

  const allCats = Object.keys(countBy(products, { ...f, q: '', brand: [], ram: [], storage: [] }, 'cat', (p) => p.category))
  const brandList = Object.entries(countBy(products, { q: '', cat: '', brand: [], ram: [], storage: [] }, 'brand', (p) => p.brand))
    .sort((a, b) => b[1] - a[1])
    .map(([b]) => b)
  const visibleBrands = showAllBrands ? brandList : brandList.slice(0, 10)

  const active = [
    f.q && { key: 'q', label: `“${f.q}”`, clear: () => update({ q: '' }) },
    f.cat && { key: 'cat', label: categoryLabel(f.cat), clear: () => update({ cat: '' }) },
    ...f.brand.map((b) => ({ key: `b-${b}`, label: b, clear: () => toggleIn('brand', b) })),
    ...f.ram.map((id) => ({ key: `r-${id}`, label: `RAM ${RAM_BUCKETS.find((b) => b.id === id)?.label}`, clear: () => toggleIn('ram', id) })),
    ...f.storage.map((id) => ({ key: `s-${id}`, label: `Memori ${STORAGE_BUCKETS.find((b) => b.id === id)?.label}`, clear: () => toggleIn('storage', id) })),
    (f.pmin || f.pmax) && { key: 'price', label: `Harga ${rangeLabel(f.pmin, f.pmax)}`, clear: () => update({ pmin: '', pmax: '' }) },
  ].filter(Boolean)

  const title = f.q
    ? `Hasil untuk “${f.q}”`
    : f.brand.length === 1 && !f.cat
      ? f.brand[0]
      : f.cat && !f.brand.length
        ? categoryLabel(f.cat)
        : 'Semua Produk'
  useTitle(title)

  const resetAll = () => setParams(f.sort !== 'baru' ? { sort: f.sort } : {})

  return (
    <div className="catalog">
      <div className="container page-head">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Beranda</Link><ChevronRight size={14} />
          <span aria-current="page">Produk</span>
        </nav>
        <h1>
          {title}
          {status === 'ready' && <span className="page-head__count">{results.length.toLocaleString('id-ID')} produk</span>}
        </h1>
      </div>

      <div className="container catalog__layout" id="hasil">
        <aside className={`filters ${filtersOpen ? 'is-open' : ''}`} aria-label="Filter produk">
          <div className="filters__head">
            <h2>Filter</h2>
            <button className="icon-btn filters__close" onClick={() => setFiltersOpen(false)} aria-label="Tutup filter"><X size={20} /></button>
          </div>

          <fieldset className="filter-group">
            <legend>Kategori</legend>
            <label className="radio">
              <input type="radio" name="cat" checked={!f.cat} onChange={() => update({ cat: '' })} />
              <span>Semua kategori</span>
            </label>
            {allCats.map((c) => (
              <label className="radio" key={c}>
                <input type="radio" name="cat" checked={f.cat === c} onChange={() => update({ cat: c })} />
                <span>{categoryLabel(c)}</span>
                <small>{facets.cat[c] ?? 0}</small>
              </label>
            ))}
          </fieldset>

          <PriceFilter
            min={f.pmin}
            max={f.pmax}
            bounds={priceBounds}
            counts={facets.price}
            onChange={(min, max) => update({ pmin: min ? String(min) : '', pmax: max ? String(max) : '' })}
          />

          <fieldset className="filter-group">
            <legend>Brand</legend>
            {visibleBrands.map((b) => (
              <label className={`check ${!facets.brand[b] && !f.brand.includes(b) ? 'is-empty' : ''}`} key={b}>
                <input type="checkbox" checked={f.brand.includes(b)} onChange={() => toggleIn('brand', b)} />
                <span>{b}</span>
                <small>{facets.brand[b] ?? 0}</small>
              </label>
            ))}
            {brandList.length > 10 && (
              <button className="link-btn" onClick={() => setShowAllBrands((s) => !s)}>
                {showAllBrands ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${brandList.length})`}
              </button>
            )}
          </fieldset>

          <fieldset className="filter-group">
            <legend>RAM</legend>
            <div className="chips chips--sm">
              {RAM_BUCKETS.map((b) => (
                <button key={b.id} className={`chip ${f.ram.includes(b.id) ? 'is-active' : ''}`} onClick={() => toggleIn('ram', b.id)} aria-pressed={f.ram.includes(b.id)} disabled={!facets.ram[b.id] && !f.ram.includes(b.id)}>
                  {b.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>Penyimpanan</legend>
            <div className="chips chips--sm">
              {STORAGE_BUCKETS.map((b) => (
                <button key={b.id} className={`chip ${f.storage.includes(b.id) ? 'is-active' : ''}`} onClick={() => toggleIn('storage', b.id)} aria-pressed={f.storage.includes(b.id)} disabled={!facets.storage[b.id] && !f.storage.includes(b.id)}>
                  {b.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="filters__foot">
            <button className="btn btn--outline" onClick={resetAll}>Reset</button>
            <button className="btn btn--primary" onClick={() => setFiltersOpen(false)}>Lihat {results.length} produk</button>
          </div>
        </aside>
        {filtersOpen && <div className="filters__backdrop" onClick={() => setFiltersOpen(false)} />}

        <div className="catalog__main">
          <div className="toolbar">
            <button className="btn btn--outline btn--sm toolbar__filter" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={16} /> Filter{active.length > 0 && ` (${active.length})`}
            </button>
            <label className="sort">
              <span>Urutkan</span>
              <select value={f.sort} onChange={(e) => update({ sort: e.target.value === 'baru' ? '' : e.target.value })}>
                {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {active.length > 0 && (
            <div className="active-filters">
              {active.map((a) => (
                <button key={a.key} className="active-chip" onClick={a.clear}>
                  {a.label} <X size={14} />
                </button>
              ))}
              <button className="link-btn" onClick={resetAll}>Reset</button>
            </div>
          )}

          {status === 'loading' && (
            <div className="grid" aria-busy="true">
              {Array.from({ length: 8 }, (_, i) => <div className="card skeleton" key={i} />)}
            </div>
          )}

          {status === 'error' && (
            <div className="empty">
              <SearchX size={32} />
              <p>Katalog gagal dimuat.</p>
              <button className="btn btn--outline btn--sm" onClick={() => window.location.reload()}>Muat ulang</button>
            </div>
          )}

          {status === 'ready' && (pageItems.length ? (
            <div className="grid">
              {pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="empty">
              <SearchX size={32} />
              <p>Produk tidak ditemukan.</p>
              <button className="btn btn--outline btn--sm" onClick={resetAll}>Reset filter</button>
            </div>
          ))}

          {status === 'ready' && totalPages > 1 && <Pagination page={page} total={totalPages} onChange={goPage} />}
        </div>
      </div>
    </div>
  )
}

const digits = (v) => Number(String(v).replace(/\D/g, '')) || null
const withDots = (n) => (n ? n.toLocaleString('id-ID') : '')

function PriceFilter({ min, max, bounds, counts, onChange }) {
  const [draft, setDraft] = useState({ min: withDots(min), max: withDots(max) })
  const [synced, setSynced] = useState({ min, max })

  // Ikuti perubahan dari URL (preset, hapus chip, reset).
  if (synced.min !== min || synced.max !== max) {
    setSynced({ min, max })
    setDraft({ min: withDots(min), max: withDots(max) })
  }

  const apply = (e) => {
    e.preventDefault()
    let lo = digits(draft.min)
    let hi = digits(draft.max)
    if (lo && hi && lo > hi) [lo, hi] = [hi, lo]
    onChange(lo, hi)
  }

  const isPreset = (r) => (r.min ?? null) === (min ?? null) && (r.max ?? null) === (max ?? null)

  return (
    <fieldset className="filter-group">
      <legend>Harga</legend>
      <div className="chips chips--sm">
        {PRICE_PRESETS.map((r) => {
          const active = isPreset(r)
          return (
            <button
              key={r.id}
              type="button"
              className={`chip ${active ? 'is-active' : ''}`}
              aria-pressed={active}
              disabled={!counts[r.id] && !active}
              onClick={() => (active ? onChange(null, null) : onChange(r.min, r.max))}
            >
              {rangeLabel(r.min, r.max)}
            </button>
          )
        })}
      </div>
      <form className="price-range" onSubmit={apply}>
        <label>
          <span>Min</span>
          <input
            inputMode="numeric"
            placeholder={bounds ? withDots(bounds.min) : '0'}
            value={draft.min}
            onChange={(e) => setDraft((d) => ({ ...d, min: withDots(digits(e.target.value)) }))}
            aria-label="Harga minimum (Rp)"
          />
        </label>
        <span className="price-range__dash" aria-hidden="true">–</span>
        <label>
          <span>Maks</span>
          <input
            inputMode="numeric"
            placeholder={bounds ? withDots(bounds.max) : ''}
            value={draft.max}
            onChange={(e) => setDraft((d) => ({ ...d, max: withDots(digits(e.target.value)) }))}
            aria-label="Harga maksimum (Rp)"
          />
        </label>
        <button type="submit" className="btn btn--dark btn--sm">Terapkan</button>
      </form>
    </fieldset>
  )
}

function pageWindow(page, total) {
  const pages = new Set([1, total, page, page - 1, page + 1])
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out = []
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push(`gap-${n}`)
    out.push(n)
  })
  return out
}

function Pagination({ page, total, onChange }) {
  return (
    <nav className="pagination" aria-label="Halaman">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Halaman sebelumnya"><ChevronLeft size={18} /></button>
      {pageWindow(page, total).map((n) =>
        typeof n === 'string' ? (
          <span key={n} className="pagination__gap">…</span>
        ) : (
          <button key={n} className={n === page ? 'is-active' : ''} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}>
            {n}
          </button>
        ),
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === total} aria-label="Halaman berikutnya"><ChevronRight size={18} /></button>
    </nav>
  )
}
