import { Link, useParams } from 'react-router'
import {
  AppWindow, Camera, Check, ChevronRight, Cpu, GitCompareArrows, MemoryStick, MessageCircle, MonitorSmartphone, SearchX,
} from 'lucide-react'
import ProductRow from '../components/ProductRow'
import { categoryLabel, formatRupiah, keySpecs, specRows, statusLabel, useCatalog } from '../lib/catalog'
import { useCompare } from '../lib/compare'
import { useTitle } from '../lib/useTitle'
import { waLinkFor } from '../data'

const KEY_ICONS = { cpu: Cpu, display: MonitorSmartphone, camera: Camera, memory: MemoryStick, os: AppWindow }

function related(products, product) {
  const t = new Date(product.date).getTime()
  return products
    .filter((p) => p.id !== product.id && p.brand === product.brand && p.category === product.category)
    .sort((a, b) => Math.abs(new Date(a.date) - t) - Math.abs(new Date(b.date) - t))
    .slice(0, 6)
}

export default function ProductDetail() {
  const { slug } = useParams()
  const { status, products } = useCatalog()
  const { has, toggle } = useCompare()
  const product = products.find((p) => p.slug === slug)
  useTitle(product?.name ?? (status === 'ready' ? 'Produk tidak ditemukan' : 'Produk'))

  if (status === 'loading') {
    return <div className="container detail"><div className="detail__grid"><div className="skeleton skeleton--tall" /><div className="skeleton skeleton--tall" /></div></div>
  }

  if (!product) {
    return (
      <div className="container detail">
        <div className="empty">
          <SearchX size={28} />
          <p>{status === 'error' ? 'Katalog gagal dimuat.' : 'Produk tidak ditemukan.'}</p>
          <Link className="btn btn--outline btn--sm" to="/produk">Lihat semua produk</Link>
        </div>
      </div>
    )
  }

  const selected = has(product.id)
  const availability = statusLabel(product.status)
  const catLink = `/produk?cat=${encodeURIComponent(product.category)}`
  const keys = keySpecs(product)

  return (
    <div className="container detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Beranda</Link><ChevronRight size={14} />
        <Link to={catLink}>{categoryLabel(product.category)}</Link><ChevronRight size={14} />
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="detail__grid">
        <div className="detail__media">
          <img src={product.img} alt={product.name} />
        </div>

        <div className="detail__info">
          <h1>{product.name}</h1>
          <p className={`detail__price ${product.price ? '' : 'is-empty'}`}>
            {formatRupiah(product.price) ?? 'Tanya harga'}
            {availability && <span className="badge badge--muted">{availability}</span>}
          </p>

          {keys.length > 0 && (
            <ul className="key-specs">
              {/* Ikon menggantikan label; label tetap ada untuk pembaca layar & tooltip. */}
              {keys.map((k) => {
                const Icon = KEY_ICONS[k.key]
                return (
                  <li key={k.key} title={`${k.label}: ${k.value}`}>
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span><span className="sr-only">{k.label}: </span>{k.value}</span>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="detail__actions">
            <a className="btn btn--primary btn--lg" href={waLinkFor(product.name)} target="_blank" rel="noreferrer">
              <MessageCircle size={18} /> Tanya Stok
            </a>
            <button className={`btn btn--lg ${selected ? 'btn--selected' : 'btn--outline'}`} onClick={() => toggle(product)} aria-pressed={selected}>
              {selected ? <Check size={18} /> : <GitCompareArrows size={18} />}
              Bandingkan
            </button>
          </div>
        </div>
      </div>

      <section className="detail__specs">
        <h2>Spesifikasi</h2>
        <dl className="spec-table">
          {specRows(product).map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="detail__related">
        <ProductRow title="Produk serupa" to={`/produk?brand=${encodeURIComponent(product.brand)}`} products={related(products, product)} />
      </div>
    </div>
  )
}
