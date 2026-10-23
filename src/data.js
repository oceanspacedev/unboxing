const UP = 'https://unboxing.id/wp-content/uploads'

export const LOGO = `${UP}/2023/10/FA_UNBOXING_IDENTITY_RGB-01-e1698636396458.png`

export const WA_NUMBER = '62819888933'
export const WA_LINK = `https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(
  'Halo admin Unboxing, saya tahu dari website. Boleh saya tanya produk/promonya?',
)}`

// Menu kategori di bawah header.
export const NAV = [
  { label: 'Smartphone', to: '/produk?cat=Mobiles' },
  { label: 'Tablet', to: '/produk?cat=Tablet' },
  { label: 'Laptop', to: '/produk?cat=Laptops' },
  { label: 'Aksesoris', to: '/produk?cat=Aksesoris' },
  { label: 'Semua Produk', to: '/produk' },
  // Di HP sudah ada di bar navigasi bawah, jadi disembunyikan dari menu ini.
  { label: 'Bandingkan', to: '/bandingkan', desktopOnly: true },
  { label: 'Lokasi Toko', to: '/lokasi-toko' },
]

export const CATEGORY_TILES = [
  { label: 'Smartphone', to: '/produk?cat=Mobiles', img: `${UP}/2026/10/motorola_edge_60_pro_shadow_1-300x300.webp` },
  { label: 'Tablet', to: '/produk?cat=Tablet', img: `${UP}/2024/02/samsung_galaxy_tab_s9_plus_x816_12gb_256gb-300x300.webp` },
  { label: 'Laptop', to: '/produk?cat=Laptops', img: `${UP}/2023/12/laptops-ideapad-s-series-ideapad-gaming-3-gallery-3-e1701940686483-300x300.webp` },
  { label: 'Aksesoris', to: '/produk?cat=Aksesoris', img: `${UP}/2026/08/oppo_enco_buds3_white_01-300x300.webp` },
]

export const BENEFITS = [
  { icon: 'BadgeCheck', label: 'Produk original' },
  { icon: 'CreditCard', label: 'Cicilan mudah' },
  { icon: 'Store', label: '80+ toko di Jawa' },
  { icon: 'Truck', label: 'Antar ke rumah' },
]

export const BANNERS = [
  {
    img: `${UP}/2026/09/BANNER-2560-X-871-px.png`,
    alt: 'OMG! Oktober makin gede promonya, diskon setiap harinya',
  },
  {
    img: `${UP}/2023/12/BANNER-UNBOXING-LANDSCAPE-1.png`,
    alt: 'Unboxing Store',
  },
]

export const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Infinix', 'Tecno', 'Huawei', 'Honor', 'Motorola', 'Itel']

// Salinan dari public/data/products.json supaya beranda tidak perlu memuat seluruh katalog.
// tag "Baru" ditampilkan untuk rilis Oktober 2026.
export const FEATURED = [
  {
    "id": 16458,
    "slug": "motorola-edge-60-pro-12gb-256gb",
    "name": "Motorola Edge 60 Pro (12GB/256GB)",
    "brand": "Motorola",
    "category": "Mobiles",
    "date": "2026-10-16",
    "url": "https://unboxing.id/product/motorola-edge-60-pro-12gb-256gb/",
    "img": "https://unboxing.id/wp-content/uploads/2026/10/motorola_edge_60_pro_shadow_1-300x300.webp",
    "specs": {
      "CPU": "Octa-core (2x 2.2 GHz Cortex-A76 & 6x 2.0 GHz Cortex-A55)",
      "RAM": "12 GB",
      "Storage": "256 GB UFS 2.2",
      "Display": "pOLED, 1B colors, 120Hz, HDR10+, 4500 nits (peak)",
      "Camera": "50 MP, f/1.8, (wide), Sony LYTIA 700C, OIS + 10 MP, f/2.0 (telephoto, 3x optical zoom / 50x hybrid zoom), OIS + 50 MP, f/2.0, 120° (ultrawide/macro), AF",
      "OS": "Android 15, Hello UI"
    },
    "price": 9299000,
    "status": "Available",
    "priceCheckedAt": "2026-10-22",
    "tag": "Baru"
  },
  {
    "id": 16454,
    "slug": "motorola-edge-70-fusion-8gb-256gb",
    "name": "Motorola Edge 70 Fusion (8GB/256GB)",
    "brand": "Motorola",
    "category": "Mobiles",
    "date": "2026-10-16",
    "url": "https://unboxing.id/product/motorola-edge-70-fusion-8gb-256gb/",
    "img": "https://unboxing.id/wp-content/uploads/2026/10/mot_edge_70_fusion_silhourtte_1-300x300.webp",
    "specs": {
      "CPU": "Octa-core (2x 2.2 GHz Cortex-A76 & 6x 2.0 GHz Cortex-A55)",
      "RAM": "8 GB",
      "Storage": "256 GB UFS 3.1",
      "Display": "Extreme AMOLED, 1B colors, 144Hz, HDR10+, 5200 nits (peak)",
      "Camera": "50 MP, f/1.8, (wide), Sony LYTIA 710, PDAF, OIS + 13 MP, f/2.2, 120° (ultrawide/macro), AF",
      "OS": "Android 16, Hello UX"
    },
    "price": 8599000,
    "status": "Available",
    "priceCheckedAt": "2026-10-22",
    "tag": "Baru"
  },
  {
    "id": 16428,
    "slug": "samsung-galaxy-tab-s12-wifi-12gb-512gb",
    "name": "Samsung Galaxy Tab S12+ WIFI (12GB/512GB)",
    "brand": "Samsung",
    "category": "Mobiles",
    "date": "2026-10-15",
    "url": "https://unboxing.id/product/samsung-galaxy-tab-s12-wifi-12gb-512gb/",
    "img": "https://unboxing.id/wp-content/uploads/2026/10/samsung_galaxy_tab_s12_plus_gray_1_-300x300.webp",
    "specs": {
      "CPU": "Octa-core (1x 4.21 GHz C1-Ultra & 3x 3.5 GHz C1-Premium & 4x 2.7 GHz C1-Pro)",
      "RAM": "12 GB",
      "Storage": "512 GB UFS 4.0",
      "Display": "Dynamic AMOLED 2X, 120Hz, HDR10+, Anti-Reflection Glass",
      "Camera": "13 MP, f/2.0, 26mm (wide), AF + 8 MP, f/2.2 (ultrawide)",
      "OS": "Android 17, One UI 9"
    },
    "price": 21999000,
    "status": "Available",
    "priceCheckedAt": "2026-10-22",
    "tag": "Baru"
  },
  {
    "id": 16145,
    "slug": "oppo-find-x9-ultra-12-512gb",
    "name": "OPPO Find X9 Ultra 12/512GB",
    "brand": "Oppo",
    "category": "Mobiles",
    "date": "2026-08-06",
    "url": "https://unboxing.id/product/oppo-find-x9-ultra-12-512gb/",
    "img": "https://unboxing.id/wp-content/uploads/2026/08/oppo_find_x9_ultra_canyon_orange_1_2-300x300.webp",
    "specs": {
      "CPU": "Octa-core (2x4.6 GHz Oryon V3 Phoenix L + 6x3.62 GHz Oryon V3 Phoenix M)",
      "RAM": "12 GB",
      "Storage": "512 GB",
      "Display": "LTPO AMOLED, 1B colors, 144Hz, Dolby Vision, HDR10+, 3600 nits (peak)",
      "Camera": "200 MP, f/1.5, 23mm (wide), Sony LYT-901, OIS + 200 MP, f/2.2, 70mm (periscope telephoto 3x) OIS + 50 MP, f/3.5, 230mm (periscope telephoto 10x) OIS + 50 MP, f/2.0, 14mm (ultrawide) + 3.2 MP (monochrome)",
      "OS": "Android 16, ColorOS 16"
    },
    "price": 27999000,
    "status": "Available",
    "priceCheckedAt": "2026-10-22"
  },
  {
    "id": 15634,
    "slug": "oppo-find-x9s-12gb-256gb",
    "name": "OPPO Find X9s 12GB/256GB",
    "brand": "Oppo",
    "category": "Mobiles",
    "date": "2026-07-27",
    "url": "https://unboxing.id/product/oppo-find-x9s-12gb-256gb/",
    "img": "https://unboxing.id/wp-content/uploads/2026/07/oppo_find_x9s_midnight_grey_1-300x300.webp",
    "specs": {
      "CPU": "Octa-core (1x3.63 GHz Cortex-X925 & 3x3.3 GHz Cortex-X4 & 4x2.4 GHz Cortex-A720)",
      "RAM": "12 GB",
      "Storage": "256 GB",
      "Display": "LTPO AMOLED, 1B colors, 120Hz, Dolby Vision, HDR10+",
      "Camera": "50 MP, f/1.6, OIS + 50 MP periscope telephoto (3x optical, OIS) + 50 MP ultrawide",
      "OS": "Android 16, ColorOS 16"
    },
    "price": 15999000,
    "status": "Available",
    "priceCheckedAt": "2026-10-22"
  },
  {
    "id": 16450,
    "slug": "motorola-edge-60-fusion-12gb-256gb",
    "name": "Motorola Edge 60 Fusion (12GB/256GB)",
    "brand": "Motorola",
    "category": "Mobiles",
    "date": "2026-10-16",
    "url": "https://unboxing.id/product/motorola-edge-60-fusion-12gb-256gb/",
    "img": "https://unboxing.id/wp-content/uploads/2026/10/motorola_edge_60_fusion_amazonite_01-300x300.webp",
    "specs": {
      "CPU": "Octa-core (2x 2.2 GHz Cortex-A76 & 6x 2.0 GHz Cortex-A55)",
      "RAM": "12 GB",
      "Storage": "256 GB UFS 2.2",
      "Display": "pOLED, 1B colors, 120Hz, HDR10+, 4500 nits (peak)",
      "Camera": "50 MP, f/1.8, (wide), Sony LYTIA 700C, PDAF, OIS + 13 MP, f/2.2, 120° (ultrawide/macro), AF",
      "OS": "Android 15, Hello UI"
    },
    "price": 6499000,
    "status": "Available",
    "priceCheckedAt": "2026-10-22",
    "tag": "Baru"
  }
]

export const GROUP_STORES = [
  { name: 'Complete Selular', img: `${UP}/2023/10/CS.png`, url: 'https://www.instagram.com/officialcompleteselular/' },
  { name: 'Pertemuan Cellular', img: `${UP}/2023/10/PC.png`, url: 'https://www.instagram.com/pertemuancellular.id/' },
  { name: 'Jaya Baru Seluler', img: `${UP}/2023/10/JB.png`, url: 'https://www.instagram.com/jayabaru_seluler/' },
  { name: 'Sinar Mas Seluler', img: `${UP}/2023/10/SMS-1.png`, url: 'https://www.instagram.com/sinarmassellulerofficial/' },
  { name: 'Korcell Store', img: `${UP}/2023/10/KC.png`, url: 'https://www.instagram.com/korcellstore/' },
]

// Dari footer "Hubungi Kami" di unboxing.id.
export const HEAD_OFFICE = 'Jl. Pantai Maju Bersama RGII No. 27–28, Pantai Indah Kapuk, Jakarta Utara 14460'

export const SOCIALS = [
  { name: 'Instagram', url: 'https://www.instagram.com/unboxingstoreid/' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@unboxing.storeid' },
  { name: 'YouTube', url: 'https://www.youtube.com/@UNBOXINGOFFICIALSTORE' },
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61552673993640' },
]

export const waLinkFor = (productName) =>
  `https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(
    `Halo admin Unboxing, saya mau tanya harga & stok ${productName}. Apakah tersedia?`,
  )}`
