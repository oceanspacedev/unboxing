import { ChevronRight } from 'lucide-react'
import { MAP_EMBED } from '../data'

export default function StoreLocator() {
  return (
    <section className="container section" id="lokasi">
      <div className="section__head">
        <h2>Lokasi Toko</h2>
        <a href="https://unboxing.id/daftar-toko-cabang/" className="more">Daftar toko <ChevronRight size={16} /></a>
      </div>
      <div className="map">
        <iframe src={MAP_EMBED} title="Peta lokasi toko Unboxing" loading="lazy" />
      </div>
    </section>
  )
}
