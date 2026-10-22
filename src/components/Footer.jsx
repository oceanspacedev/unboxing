import { Link } from 'react-router'
import { GROUP_STORES, LOGO, SOCIALS, WA_LINK, WA_NUMBER } from '../data'
import SocialIcon from './SocialIcon'

const YEAR = new Date().getFullYear()

const phone = `+${WA_NUMBER.slice(0, 2)} ${WA_NUMBER.slice(2, 5)}-${WA_NUMBER.slice(5, 9)}-${WA_NUMBER.slice(9)}`

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <img src={LOGO} alt="Unboxing" />
          <div className="socials">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer" aria-label={s.name}>
                <SocialIcon name={s.name} size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3>Belanja</h3>
          <ul>
            <li><Link to="/produk?cat=Mobiles">Smartphone</Link></li>
            <li><Link to="/produk?cat=Tablet">Tablet</Link></li>
            <li><Link to="/produk?cat=Laptops">Laptop</Link></li>
            <li><Link to="/produk">Semua Produk</Link></li>
            <li><Link to="/bandingkan">Bandingkan</Link></li>
          </ul>
        </div>

        <div>
          <h3>Unboxing</h3>
          <ul>
            <li><a href="https://unboxing.id/tentang-kami/">Tentang Kami</a></li>
            <li><Link to="/#lokasi">Lokasi Toko</Link></li>
            <li><a href="https://unboxing.id/marketplace/">Marketplace</a></li>
          </ul>
        </div>

        <div>
          <h3>Grup</h3>
          <ul>
            {GROUP_STORES.map((s) => (
              <li key={s.name}><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Layanan Pelanggan</h3>
          <ul>
            <li><a href={WA_LINK} target="_blank" rel="noreferrer">WhatsApp {phone}</a></li>
            <li>Senin–Jumat, 09.00–18.00</li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">© {YEAR} Unboxing Store</div>
    </footer>
  )
}
