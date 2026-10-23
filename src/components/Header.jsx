import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { GitCompareArrows, MessageCircle, Search } from 'lucide-react'
import { LOGO, NAV, WA_LINK } from '../data'
import { useCompare } from '../lib/compare'

function SearchBox() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const urlQuery = pathname === '/produk' ? params.get('q') ?? '' : ''
  const [value, setValue] = useState(urlQuery)
  const [synced, setSynced] = useState(urlQuery)

  // Ikuti perubahan ?q= dari halaman produk (mis. tombol reset).
  if (urlQuery !== synced) {
    setSynced(urlQuery)
    setValue(urlQuery)
  }

  const submit = (e) => {
    e.preventDefault()
    const q = value.trim()
    navigate(q ? `/produk?q=${encodeURIComponent(q)}` : '/produk')
  }

  return (
    <form className="search" onSubmit={submit} role="search">
      <input
        type="search"
        placeholder="Cari produk"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Cari produk"
      />
      <button type="submit" aria-label="Cari"><Search size={18} /></button>
    </form>
  )
}

// Link menu memakai query (?cat=), jadi status aktif dicek manual.
function isActive(to, { pathname, search }) {
  const [path, query = ''] = to.split('?')
  if (path.includes('#')) return false
  if (path !== pathname) return false
  const want = new URLSearchParams(query).get('cat') ?? ''
  const have = new URLSearchParams(search).get('cat') ?? ''
  return want === have
}

export default function Header() {
  const location = useLocation()
  const { items } = useCompare()

  return (
    <>
      <header className="header">
        <div className="container header__bar">
          <Link to="/" className="header__logo" aria-label="Unboxing beranda">
            <img src={LOGO} alt="Unboxing" />
          </Link>
          <SearchBox />
          <nav className="header__actions" aria-label="Akun">
            <Link to="/bandingkan" className="header__icon" aria-label={`Bandingkan (${items.length})`}>
              <GitCompareArrows size={22} />
              {items.length > 0 && <span className="count-badge">{items.length}</span>}
              <span className="header__icon-label">Bandingkan</span>
            </Link>
            <a href={WA_LINK} target="_blank" rel="noreferrer" className="header__icon" aria-label="Hubungi CS">
              <MessageCircle size={22} />
              <span className="header__icon-label">Hubungi CS</span>
            </a>
          </nav>
        </div>
      </header>
      <nav className="subnav" aria-label="Kategori">
        <div className="container subnav__list">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={[isActive(n.to, location) && 'is-active', n.desktopOnly && 'desktop-only'].filter(Boolean).join(' ')}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
