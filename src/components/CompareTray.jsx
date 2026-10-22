import { Link, useLocation } from 'react-router'
import { GitCompareArrows, X } from 'lucide-react'
import { MAX_COMPARE, useCompare } from '../lib/compare'

export default function CompareTray() {
  const { items, remove, clear, notice } = useCompare()
  const { pathname } = useLocation()
  const onComparePage = pathname === '/bandingkan'

  return (
    <>
      {notice && <div className="toast" role="status">{notice}</div>}

      {items.length > 0 && !onComparePage && (
        <div className="tray" role="region" aria-label="Produk yang akan dibandingkan">
          <div className="tray__items">
            {Array.from({ length: MAX_COMPARE }, (_, i) => {
              const p = items[i]
              return p ? (
                <div className="tray__item" key={p.id} title={p.name}>
                  <img src={p.img} alt="" />
                  <button onClick={() => remove(p.id)} aria-label={`Hapus ${p.name}`}><X size={12} /></button>
                </div>
              ) : (
                <div className="tray__item tray__item--empty" key={`empty-${i}`} />
              )
            })}
          </div>
          <span className="tray__count">{items.length}/{MAX_COMPARE} dipilih</span>
          <button className="tray__clear" onClick={clear}>Hapus semua</button>
          <Link to="/bandingkan" className="btn btn--primary btn--sm">
            <GitCompareArrows size={16} /> Bandingkan
          </Link>
        </div>
      )}
    </>
  )
}
