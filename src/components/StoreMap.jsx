import { useNavigate } from 'react-router'
import MAP from '../assets/store-map.json'

// Peta titik Indonesia + pin kelompok toko. Data dibuat oleh `npm run map`.
// Di perangkat ber-mouse, pin baru muncul (dengan animasi) saat kursor berada di atas peta.
const PIN = 'M0 0C-1.3-1.7-2.2-2.9-2.2-4A2.2 2.2 0 1 1 2.2-4C2.2-2.9 1.3-1.7 0 0Z'

export default function StoreMap() {
  const { cols, rows, dots, pins, total } = MAP
  const navigate = useNavigate()
  // <a> di dalam SVG bukan <Link>, jadi navigasi SPA ditangani manual.
  const open = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate('/lokasi-toko')
  }

  return (
    <svg
      className="store-map"
      viewBox={`-1 -1 ${cols + 2} ${rows + 2}`}
      role="img"
      aria-label={`Peta ${total} toko Unboxing di Pulau Jawa`}
    >
      <g className="store-map__land">
        {dots.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={0.3} />)}
      </g>
      {pins.map((p, i) => (
        <a key={p.label} href="/lokasi-toko" onClick={open} className="store-map__pin" style={{ '--i': i }}>
          <title>{`${p.label} dan sekitarnya: ${p.count} toko`}</title>
          {/* g luar = posisi (atribut transform), g dalam = animasi (CSS transform) */}
          <g transform={`translate(${p.xy[0]} ${p.xy[1]})`}>
            <circle className="store-map__pulse" r={1.4} />
            <g className="store-map__marker">
              <g transform="scale(0.85)">
                <path d={PIN} />
                <circle cx={0} cy={-4} r={0.85} fill="#fff" />
              </g>
            </g>
          </g>
        </a>
      ))}
    </svg>
  )
}
