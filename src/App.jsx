import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Compare from './pages/Compare'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="produk" element={<ProductList />} />
        <Route path="produk/:slug" element={<ProductDetail />} />
        <Route path="bandingkan" element={<Compare />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
