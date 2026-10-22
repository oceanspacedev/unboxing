import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Check, ChevronRight, GitCompareArrows, Link2, MessageCircle, Plus, Search, Trash2, X } from 'lucide-react'
import { SPEC_ROWS, categoryLabel, formatRupiah, useCatalog } from '../lib/catalog'
import { MAX_COMPARE, useCompare } from '../lib/compare'
import { useTitle } from '../lib/useTitle'
import { waLinkFor } from '../data'

const clean = (v) => (v && v.trim() && v.trim() !== '-' ? v.trim() : null)

// Harga: yang termurah disorot. Spesifikasi numerik: yang terbesar disorot.
const ROWS = [
  { label: 'Harga', value: (p) => formatRupiah(p.price), num: (p) => p.price ?? null, prefer: 'min', badge: 'Termurah', empty: 'Tanya CS' },
  ...SPEC_ROWS.map((r) => ({ label: r.label, value: (p) => clean(r.get(p.specs)), num: r.best, prefer: 'max', badge: 'Terbesar' })),
]

function bestFlags(row, products) {
  if (!row.num || products.length < 2) return null
  const nums = products.map((p) => row.num(p))
  const known = nums.filter((n) => n != null)
  if (known.length < 2) return null
  const target = row.prefer === 'min' ? Math.min(...known) : Math.max(...known)
  if (known.every((n) => n === target)) return null
  return nums.map((n) => n === target)
}

function AddProduct({ products, exclude, onAdd, autoFocus }) {
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return []
    return products
      .filter((p) => !exclude.has(p.id) && terms.every((t) => `${p.name} ${p.brand}`.toLowerCase().includes(t)))
      .slice(0, 8)
  }, [q, products, exclude])

  return (
    <div className="add-product">
      <div className="field-search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tambah produk"
          aria-label="Cari produk untuk dibandingkan"
          autoFocus={autoFocus}
        />
      </div>
      {results.length > 0 && (
        <ul className="add-product__results" role="listbox">
          {results.map((p) => (
            <li key={p.id}>
              <button onClick={() => { onAdd(p); setQ('') }} role="option" aria-selected="false">
                <img src={p.img} alt="" loading="lazy" />
                <span>{p.name}<small>{p.brand} · {categoryLabel(p.category)}</small></span>
                <Plus size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.trim() && !results.length && <p className="add-product__none">Produk tidak ditemukan.</p>}
    </div>
  )
}

export default function Compare() {
  useTitle('Bandingkan Produk')
  const { status, products } = useCatalog()
  const { items, add, remove, clear, replaceAll } = useCompare()
  const [params, setParams] = useSearchParams()
  const [diffOnly, setDiffOnly] = useState(false)
  const [copied, setCopied] = useState(false)

  // Link bersama: /bandingkan?ids=1,2,3 → isi perbandingan, lalu bersihkan URL.
  const sharedIds = params.get('ids')
  useEffect(() => {
    if (!sharedIds || status !== 'ready') return
    const found = sharedIds.split(',').map((id) => products.find((p) => p.id === Number(id))).filter(Boolean)
    if (found.length) replaceAll(found)
    setParams({}, { replace: true })
  }, [sharedIds, status, products, replaceAll, setParams])

  const exclude = useMemo(() => new Set(items.map((p) => p.id)), [items])

  // Item tersimpan bisa berasal dari katalog lama; pakai versi terbaru (harga, status) bila sudah dimuat.
  const current = useMemo(
    () => items.map((i) => products.find((p) => p.id === i.id) ?? i),
    [items, products],
  )

  const rows = useMemo(() => {
    return ROWS.map((r) => {
      const values = current.map((p) => r.value(p))
      if (values.every((v) => !v) && !r.empty) return null
      const allSame = current.length > 1 && values.every((v) => v === values[0])
      return { label: r.label, values, allSame, best: bestFlags(r, current), badge: r.badge, empty: r.empty }
    }).filter(Boolean)
  }, [current])

  const visibleRows = diffOnly ? rows.filter((r) => !r.allSame) : rows
  const sameCategory = items.every((p) => p.category === items[0]?.category)

  const copyLink = async () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}bandingkan?ids=${items.map((p) => p.id).join(',')}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Salin link ini:', url)
    }
  }

  return (
    <div className="compare-page">
      <div className="container compare">
        <div className="page-head">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Beranda</Link><ChevronRight size={14} />
            <span aria-current="page">Bandingkan</span>
          </nav>
          <h1>Bandingkan Produk</h1>
        </div>

        {items.length === 0 ? (
          <div className="compare__empty">
            <GitCompareArrows size={28} strokeWidth={1.5} />
            <p>Belum ada produk dipilih.</p>
            {status === 'ready' && <AddProduct products={products} exclude={exclude} onAdd={add} autoFocus />}
            <Link className="more" to="/produk">Lihat semua produk <ChevronRight size={16} /></Link>
          </div>
        ) : (
          <>
            <div className="compare__toolbar">
              <label className="switch">
                <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} disabled={items.length < 2} />
                <span className="switch__track" aria-hidden="true" />
                Hanya perbedaan
              </label>
              <div className="compare__toolbar-actions">
                <button className="btn btn--outline btn--sm" onClick={copyLink}>
                  {copied ? <Check size={15} /> : <Link2 size={15} />} {copied ? 'Disalin' : 'Salin link'}
                </button>
                <button className="btn btn--outline btn--sm" onClick={clear}><Trash2 size={15} /> Hapus</button>
              </div>
            </div>

            <div className="compare__scroll">
              <table className="compare-table" style={{ '--cols': items.length + (items.length < MAX_COMPARE ? 1 : 0) }}>
                <thead>
                  <tr>
                    <th scope="col" className="compare-table__corner">
                      <span>{items.length}/{MAX_COMPARE}</span>
                    </th>
                    {items.map((p) => (
                      <th scope="col" key={p.id}>
                        <div className="compare-head">
                          <button className="compare-head__remove" onClick={() => remove(p.id)} aria-label={`Hapus ${p.name}`}><X size={16} /></button>
                          <Link to={`/produk/${p.slug}`} className="compare-head__img"><img src={p.img} alt="" /></Link>
                          <Link to={`/produk/${p.slug}`} className="compare-head__name">{p.name}</Link>
                        </div>
                      </th>
                    ))}
                    {items.length < MAX_COMPARE && (
                      <th scope="col" className="compare-table__add">
                        {status === 'ready' ? (
                          <AddProduct products={products} exclude={exclude} onAdd={add} />
                        ) : (
                          <div className="skeleton skeleton--input" />
                        )}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {!(diffOnly && sameCategory) && (
                    <tr className={sameCategory && items.length > 1 ? 'is-same' : ''}>
                      <th scope="row">Kategori</th>
                      {items.map((p) => <td key={p.id}>{categoryLabel(p.category)}</td>)}
                      {items.length < MAX_COMPARE && <td className="compare-table__add" />}
                    </tr>
                  )}
                  {visibleRows.map((r) => (
                    <tr key={r.label} className={`${r.allSame ? 'is-same' : ''} ${r.label === 'Harga' ? 'is-price' : ''}`}>
                      <th scope="row">{r.label}</th>
                      {r.values.map((v, i) => (
                        <td key={items[i].id} className={r.best?.[i] ? 'is-best' : ''}>
                          {v ?? <span className="muted">{r.empty ?? '—'}</span>}
                          {r.best?.[i] && <span className="best-badge">{r.badge}</span>}
                        </td>
                      ))}
                      {items.length < MAX_COMPARE && <td className="compare-table__add" />}
                    </tr>
                  ))}
                  {diffOnly && visibleRows.length === 0 && (
                    <tr><td colSpan={items.length + 2} className="muted">Semua spesifikasi sama.</td></tr>
                  )}
                  <tr className="compare-table__actions">
                    <th scope="row" />
                    {items.map((p) => (
                      <td key={p.id}>
                        <a className="btn btn--primary btn--sm" href={waLinkFor(p.name)} target="_blank" rel="noreferrer">
                          <MessageCircle size={15} /> Tanya Stok
                        </a>
                      </td>
                    ))}
                    {items.length < MAX_COMPARE && <td className="compare-table__add" />}
                  </tr>
                </tbody>
              </table>
            </div>
                      </>
        )}
      </div>
    </div>
  )
}
