import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Header from './Header'
import Footer from './Footer'
import MobileBar from './MobileBar'
import CompareTray from './CompareTray'

// Pindah halaman → ke atas; link "/#promo" → scroll ke section-nya.
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname, hash])

  return null
}

export default function Layout() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CompareTray />
      <MobileBar />
    </>
  )
}
