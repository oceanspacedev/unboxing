import { Link } from 'react-router'
import { BRANDS } from '../data'

export default function BrandGrid() {
  return (
    <section className="container section">
      <div className="section__head">
        <h2>Brand</h2>
      </div>
      <div className="brands">
        {BRANDS.map((b) => (
          <Link key={b} to={`/produk?brand=${encodeURIComponent(b)}`} className="brand">{b}</Link>
        ))}
      </div>
    </section>
  )
}
