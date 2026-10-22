import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

// Satu baris produk di beranda: grid di desktop, geser horizontal di HP.
export default function ProductRow({ title, to, products, loading = false }) {
  if (!loading && !products.length) return null

  return (
    <section className="container section">
      <div className="section__head">
        <h2>{title}</h2>
        {to && <Link to={to} className="more">Lihat semua <ChevronRight size={16} /></Link>}
      </div>
      <div className="row">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <div className="card skeleton" key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} tag={p.tag} />)}
      </div>
    </section>
  )
}
