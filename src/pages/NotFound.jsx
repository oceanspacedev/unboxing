import { Link } from 'react-router'
import { useTitle } from '../lib/useTitle'

export default function NotFound() {
  useTitle('Halaman tidak ditemukan')
  return (
    <section className="container not-found">
      <span className="not-found__code">404</span>
      <h1>Halaman tidak ditemukan</h1>
      <div className="not-found__actions">
        <Link className="btn btn--primary" to="/">Ke Beranda</Link>
        <Link className="btn btn--outline" to="/produk">Lihat Produk</Link>
      </div>
    </section>
  )
}
