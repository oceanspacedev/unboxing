import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, MapPin, Navigation, Search, SearchX } from 'lucide-react'
import STORES from '../assets/stores.json'
import { GROUP_STORES } from '../data'
import { useTitle } from '../lib/useTitle'

const ALL_STORES_MAP = 'https://www.google.com/maps/d/embed?mid=1lmPXV6TVFJ3C70jHFVBu2varDlUWmk8&ehbc=2E312F&noprof=1'
const storeMap = (s) => `https://maps.google.com/maps?q=${s.lat},${s.lng}&z=16&output=embed`
const directions = (s) => `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`

// Nama grup di KML ("Sinar Mas Selular") sedikit beda dengan data.js ("Sinar Mas Seluler"): cocokkan kata pertama.
const firstWord = (s) => s.split(/\s+/)[0].toLowerCase()
const logoOf = (group) => GROUP_STORES.find((g) => firstWord(g.name) === firstWord(group))?.img

const GROUPS = Object.entries(STORES.reduce((acc, s) => ({ ...acc, [s.group]: (acc[s.group] ?? 0) + 1 }), {}))
  .sort((a, b) => b[1] - a[1])

const keyOf = (s) => `${s.name}|${s.lat}|${s.lng}`

export default function StoreLocations() {
  useTitle('Lokasi Toko')
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('')
  const [selected, setSelected] = useState(null)
  const mapRef = useRef(null)

  const byCity = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const list = STORES.filter(
      (s) => (!group || s.group === group) && terms.every((t) => `${s.name} ${s.city} ${s.group}`.toLowerCase().includes(t)),
    )
    const map = new Map()
    for (const s of list) map.set(s.city, [...(map.get(s.city) ?? []), s])
    return [...map].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
  }, [q, group])

  const count = byCity.reduce((n, [, list]) => n + list.length, 0)

  const choose = (s) => {
    setSelected(s)
    // Di HP peta ada di atas daftar: gulir ke peta supaya perubahan terlihat.
    if (window.matchMedia('(max-width: 960px)').matches) mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="container stores-page">
      <div className="page-head">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Beranda</Link><ChevronRight size={14} />
          <span aria-current="page">Lokasi Toko</span>
        </nav>
        <h1>Lokasi Toko <span className="page-head__count">{STORES.length} toko</span></h1>
      </div>

      <div className="stores-layout">
        <section className="stores-panel" aria-label="Daftar toko">
          <div className="field-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari kota atau nama toko"
              aria-label="Cari kota atau nama toko"
            />
          </div>

          <div className="chips stores-chips" role="group" aria-label="Filter grup toko">
            <button className={`chip ${!group ? 'is-active' : ''}`} onClick={() => setGroup('')} aria-pressed={!group}>
              Semua
            </button>
            {GROUPS.map(([g, n]) => (
              <button key={g} className={`chip ${group === g ? 'is-active' : ''}`} onClick={() => setGroup(group === g ? '' : g)} aria-pressed={group === g}>
                {g} <span className="chip__count">{n}</span>
              </button>
            ))}
          </div>

          {count === 0 ? (
            <div className="empty">
              <SearchX size={28} />
              <p>Toko tidak ditemukan.</p>
            </div>
          ) : (
            <div className="stores-list">
              {byCity.map(([city, list]) => (
                <div key={city} className="stores-city">
                  <h2>{city} <span>{list.length}</span></h2>
                  <ul>
                    {list.map((s) => {
                      const active = selected && keyOf(selected) === keyOf(s)
                      const logo = logoOf(s.group)
                      return (
                        <li key={keyOf(s)} className={`store ${active ? 'is-active' : ''}`}>
                          <button className="store__main" onClick={() => choose(s)} aria-pressed={active}>
                            <span className="store__logo">{logo ? <img src={logo} alt="" loading="lazy" /> : <MapPin size={16} />}</span>
                            <span className="store__text">
                              <strong>{s.name}</strong>
                              <small>{s.group}</small>
                            </span>
                          </button>
                          <a className="store__route" href={directions(s)} target="_blank" rel="noreferrer" aria-label={`Rute ke ${s.name}`}>
                            <Navigation size={15} /> Rute
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="stores-map" ref={mapRef} aria-label="Peta">
          <div className="stores-map__bar">
            <span>{selected ? selected.name : 'Semua toko'}</span>
            {selected && <button className="link-btn" onClick={() => setSelected(null)}>Tampilkan semua</button>}
          </div>
          <iframe
            key={selected ? keyOf(selected) : 'all'}
            src={selected ? storeMap(selected) : ALL_STORES_MAP}
            title={selected ? `Peta ${selected.name}` : 'Peta semua toko Unboxing'}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </div>
    </div>
  )
}
