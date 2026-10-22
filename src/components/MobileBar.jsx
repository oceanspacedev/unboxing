import { NavLink } from 'react-router'
import { GitCompareArrows, Home, MapPin, MessageCircle, ShoppingBag } from 'lucide-react'
import { WA_LINK } from '../data'
import { useCompare } from '../lib/compare'

const ITEMS = [
  { label: 'Beranda', to: '/', Icon: Home, end: true },
  { label: 'Produk', to: '/produk', Icon: ShoppingBag },
  { label: 'Bandingkan', to: '/bandingkan', Icon: GitCompareArrows },
  { label: 'Toko', to: '/#lokasi', Icon: MapPin },
]

export default function MobileBar() {
  const { items } = useCompare()

  return (
    <>
      <a className="wa-fab" href={WA_LINK} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp">
        <MessageCircle size={26} />
      </a>
      <nav className="mobile-bar" aria-label="Navigasi cepat">
        {ITEMS.map(({ label, to, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive && !to.includes('#') ? 'is-active' : '')}>
            <span className="mobile-bar__icon">
              <Icon size={20} />
              {to === '/bandingkan' && items.length > 0 && <span className="nav-badge">{items.length}</span>}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
