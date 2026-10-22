import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BANNERS } from '../data'

const INTERVAL = 6000

export default function PromoCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = BANNERS.length

  const go = useCallback((i) => setIndex((i + count) % count), [count])

  useEffect(() => {
    if (paused || count < 2) return
    const t = setTimeout(() => go(index + 1), INTERVAL)
    return () => clearTimeout(t)
  }, [index, paused, count, go])

  return (
    <section className="container promo" id="promo" aria-label="Promo">
      <div className="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="carousel__track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {BANNERS.map((b, i) => (
            <div className="carousel__slide" key={b.img} aria-hidden={i !== index}>
              <img src={b.img} alt={b.alt} loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
        {count > 1 && (
          <>
            <button className="carousel__arrow carousel__arrow--prev" onClick={() => go(index - 1)} aria-label="Sebelumnya"><ChevronLeft size={20} /></button>
            <button className="carousel__arrow carousel__arrow--next" onClick={() => go(index + 1)} aria-label="Berikutnya"><ChevronRight size={20} /></button>
            <div className="carousel__dots">
              {BANNERS.map((b, i) => (
                <button key={b.img} className={i === index ? 'is-active' : ''} onClick={() => go(i)} aria-label={`Promo ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
