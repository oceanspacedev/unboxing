import { Link } from 'react-router'
import { ChevronRight, MessageCircle } from 'lucide-react'
import { GROUP_STORES, HEAD_OFFICE, SOCIALS, WA_LINK, WA_NUMBER } from '../data'
import MAP from '../assets/store-map.json'
import SocialIcon from './SocialIcon'
import StoreMap from './StoreMap'

const YEAR = new Date().getFullYear()

// "62819888933" → "+62 819-888-933"
const phone = `+${WA_NUMBER.slice(0, 2)} ${WA_NUMBER.slice(2).match(/.{1,3}/g).join('-')}`

const NAV = [
  { label: 'Beranda', to: '/' },
  { label: 'Smartphone', to: '/produk?cat=Mobiles' },
  { label: 'Tablet', to: '/produk?cat=Tablet' },
  { label: 'Laptop', to: '/produk?cat=Laptops' },
  { label: 'Aksesoris', to: '/produk?cat=Aksesoris' },
  { label: 'Bandingkan', to: '/bandingkan' },
  { label: 'Lokasi Toko', to: '/lokasi-toko' },
  { label: 'Tentang Kami', href: 'https://unboxing.id/tentang-kami/' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <nav className="footer__col" aria-label="Footer">
          <h3>Unboxing</h3>
          <ul className="footer__nav">
            {NAV.map((l) => (
              <li key={l.label}>{l.to ? <Link to={l.to}>{l.label}</Link> : <a href={l.href}>{l.label}</a>}</li>
            ))}
          </ul>
        </nav>

        <div className="footer__col footer__info">
          <div>
            <h3>Head Office</h3>
            <p>{HEAD_OFFICE}</p>
          </div>
          <div>
            <h3>Layanan Pelanggan</h3>
            <p>Senin–Jumat, 09.00–18.00 WIB</p>
            <a className="footer__link" href={WA_LINK} target="_blank" rel="noreferrer">{phone}</a>
          </div>
          <div>
            <h3>Grup Unboxing</h3>
            <ul className="group-logos">
              {GROUP_STORES.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noreferrer" title={s.name}>
                    <img src={s.img} alt={s.name} loading="lazy" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="socials">
            <a href={WA_LINK} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={17} /></a>
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer" aria-label={s.name}>
                <SocialIcon name={s.name} size={17} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer__map">
          <StoreMap />
          <Link className="footer__map-link" to="/lokasi-toko">
            {MAP.total} toko di Jawa Barat &amp; Jawa Tengah <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      <p className="footer__bottom">© {YEAR} Unboxing Store</p>
    </footer>
  )
}
