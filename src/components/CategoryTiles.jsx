import { Link } from 'react-router'
import { CATEGORY_TILES } from '../data'

export default function CategoryTiles() {
  return (
    <section className="container section" aria-label="Kategori">
      <div className="tiles">
        {CATEGORY_TILES.map((c) => (
          <Link key={c.to} to={c.to} className="tile">
            <span className="tile__img"><img src={c.img} alt="" loading="lazy" /></span>
            <span className="tile__label">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
