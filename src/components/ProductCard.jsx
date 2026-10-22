import { Link } from 'react-router'
import { Check } from 'lucide-react'
import { formatRupiah, statusLabel } from '../lib/catalog'
import { useCompare } from '../lib/compare'

export default function ProductCard({ product, tag }) {
  const { has, toggle } = useCompare()
  const selected = has(product.id)
  const status = statusLabel(product.status)

  return (
    <article className="card">
      <Link to={`/produk/${product.slug}`} className="card__link">
        <div className="card__img">
          <img src={product.img} alt="" loading="lazy" />
          {(status || tag) && <span className={`badge ${status ? 'badge--muted' : ''}`}>{status ?? tag}</span>}
        </div>
        <h3 className="card__name">{product.name}</h3>
        <p className={`card__price ${product.price ? '' : 'is-empty'}`}>
          {formatRupiah(product.price) ?? 'Tanya harga'}
        </p>
      </Link>
      <label className={`card__compare ${selected ? 'is-on' : ''}`}>
        <input type="checkbox" checked={selected} onChange={() => toggle(product)} />
        <span className="checkbox" aria-hidden="true">{selected && <Check size={12} strokeWidth={3} />}</span>
        Bandingkan
      </label>
    </article>
  )
}
