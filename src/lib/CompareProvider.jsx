import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CompareContext, MAX_COMPARE } from './compare'

const STORAGE_KEY = 'unboxing:compare'

// Hanya field yang dibutuhkan tray & tabel yang disimpan.
const slim = ({ id, slug, name, brand, category, img, url, specs, price, status, priceCheckedAt }) =>
  ({ id, slug, name, brand, category, img, url, specs, price, status, priceCheckedAt })

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : []
  } catch {
    return []
  }
}

export function CompareProvider({ children }) {
  const [items, setItems] = useState(readStored)
  const [notice, setNotice] = useState(null)
  const timer = useRef()

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* storage diblokir */ }
  }, [items])

  const flash = useCallback((msg) => {
    clearTimeout(timer.current)
    setNotice(msg)
    timer.current = setTimeout(() => setNotice(null), 2800)
  }, [])

  const has = useCallback((id) => items.some((p) => p.id === id), [items])

  const add = useCallback((product) => {
    if (items.some((p) => p.id === product.id)) return
    if (items.length >= MAX_COMPARE) {
      flash(`Maksimal ${MAX_COMPARE} produk. Hapus salah satu dulu.`)
      return
    }
    setItems([...items, slim(product)])
  }, [items, flash])

  const remove = useCallback((id) => setItems((prev) => prev.filter((p) => p.id !== id)), [])
  const toggle = useCallback((product) => (has(product.id) ? remove(product.id) : add(product)), [has, add, remove])
  const clear = useCallback(() => setItems([]), [])
  const replaceAll = useCallback((products) => setItems(products.slice(0, MAX_COMPARE).map(slim)), [])

  const value = useMemo(
    () => ({ items, has, add, remove, toggle, clear, replaceAll, notice }),
    [items, has, add, remove, toggle, clear, replaceAll, notice],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}
