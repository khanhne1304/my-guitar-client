// src/views/components/Data/dataProduct.js

export const MOCK_PRODUCTS = [
  {
    _id: 'p1',
    slug: 'guitar-acoustic-yamaha-f310',
    name: 'Guitar Acoustic Yamaha F310',
    sku: 'YA-F310',
    brand: { name: 'YAMAHA', slug: 'yamaha' },
    category: { name: 'Guitar', slug: 'guitar' },
    price: { base: 2_500_000, sale: 2_200_000, currency: 'VND' },
    stock: 12, // tồn kho
    rating: 4.7,
    images: [
      { url: 'https://www.taylorguitars.com/sites/default/files/styles/guitar_desktop/public/images/2024-03/Taylor-214ce-2209073120-FrontLeft-2023.png?itok=2PzyI75S', alt: 'Yamaha F310 Acoustic Guitar - Góc nhìn chính' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', alt: 'Yamaha F310 - Chi tiết thân đàn và soundhole' },
      { url: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=800&auto=format&fit=crop', alt: 'Yamaha F310 - Cần đàn và phím đàn' },
      { url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&auto=format&fit=crop', alt: 'Yamaha F310 - Đầu đàn và máy lên dây' },
      { url: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=800&auto=format&fit=crop', alt: 'Yamaha F310 - Góc nhìn tổng thể' }
    ],
    attributes: {
      type: 'acoustic',
      strings: 6,
      bodyMaterial: 'Spruce',
      neckMaterial: 'Nato',
      fingerboardMaterial: 'Rosewood',
      scaleLength: '634mm',
      bodySize: 'Dreadnought',
      origin: 'Indonesia',
      weight: '2.4 kg',
      size: '103 x 41 x 11 cm'
    },
    highlights: [
      'Thân đàn Dreadnought cho âm thanh vang và đầy',
      'Mặt top gỗ Spruce tự nhiên – tiếng sáng, rõ',
      'Cần đàn Nato bền bỉ, ổn định trong khí hậu VN',
      'Phím Rosewood 20 phím – dễ chơi cho người mới',
    ],
    gifts: [
      'Túi đựng guitar cao cấp',
      'Bộ dây đàn dự phòng',
      'Sách hướng dẫn guitar cơ bản',
    ],
    warrantyMonths: 24,
    shipping: { innerCityFree: true },
    description: `🎸   Yamaha F310 - Guitar Acoustic Chất Lượng Cao  

  Đặc điểm nổi bật:  

•   Thân đàn Dreadnought   với mặt trước làm từ gỗ Spruce tự nhiên, tạo âm thanh trong trẻo và mạnh mẽ

•   Cần đàn Nato   với độ bền cao, phù hợp với khí hậu Việt Nam

•   Phím đàn Rosewood   với 20 phím, độ chính xác cao, dễ chơi

•   Máy lên dây   chất lượng cao, giữ dây ổn định

  Phù hợp cho:  

✅ Người mới học guitar

✅ Biểu diễn acoustic

✅ Đệm hát, solo

✅ Du lịch, picnic

  Bao gồm:  

📦 Guitar Yamaha F310

📦 Dây đàn dự phòng

📦 Túi đựng guitar cao cấp

📦 Sách hướng dẫn chơi guitar cơ bản

📦 Bảo hành chính hãng 2 năm

  Thông số kỹ thuật:  

• Kích thước: 103 x 41 x 11 cm

• Trọng lượng: 2.4 kg

• Số dây: 6 dây

• Loại đàn: Acoustic

• Xuất xứ: Indonesia

 Giá khuyến mãi chỉ áp dụng trong tháng này! `,
    videoUrl: '',
  },

  {
    _id: 'p2',
    slug: 'guitar-electric-fender-stratocaster',
    name: 'Guitar Electric Fender Stratocaster',
    sku: 'FE-STRAT',
    brand: { name: 'FENDER', slug: 'fender' },
    category: { name: 'Guitar', slug: 'guitar' },
    price: { base: 15_000_000, sale: 15_000_000, currency: 'VND' },
    stock: 8,
    rating: 4.9,
    images: [
      { url: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=800&auto=format&fit=crop', alt: 'Fender Stratocaster - Chi tiết pickup và điều khiển' },
      { url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&auto=format&fit=crop', alt: 'Fender Stratocaster - Đầu đàn và máy lên dây' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', alt: 'Fender Stratocaster - Cần đàn và phím đàn' },
      { url: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=800&auto=format&fit=crop', alt: 'Fender Stratocaster - Góc nhìn tổng thể' },
    ],
    attributes: {
      type: 'electric',
      strings: 6,
      pickups: 'SSS',
      bodyMaterial: 'Alder',
      neckMaterial: 'Maple',
      fingerboardMaterial: 'Rosewood',
      bridge: '2-Point Tremolo',
      origin: 'Mexico',
      weight: '3.2 kg',
      size: '101 x 35 x 10 cm'
    },
    highlights: [
      'Thân Alder – âm cân bằng, ấm',
      '3 Single-Coil pickups: chất Strat đặc trưng',
      'Cần Maple, cảm giác chơi mượt',
      'Tremolo bridge cho hiệu ứng vibrato linh hoạt',
    ],
    gifts: [
      'Hộp cứng Fender',
      'Dây đàn dự phòng',
      'Cable 3m + strap',
    ],
    warrantyMonths: 60,
    shipping: { innerCityFree: true },
    description: `⚡   Fender Stratocaster - Huyền thoại guitar điện   với chất âm linh hoạt cho Rock/Blues/Jazz.`,
    videoUrl: '',
  },

  {
    _id: 'p3',
    slug: 'piano-digital-roland-fp30x',
    name: 'Piano Digital Roland FP-30X',
    sku: 'RO-FP30X',
    brand: { name: 'ROLAND', slug: 'roland' },
    category: { name: 'Piano', slug: 'piano' },
    price: { base: 25_000_000, sale: 22_000_000, currency: 'VND' },
    stock: 5,
    rating: 4.8,
    images: [
      { url: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?q=80&w=800&auto=format&fit=crop', alt: 'Roland FP-30X Digital Piano - Góc nhìn chính' },
      { url: 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=800&auto=format&fit=crop', alt: 'Roland FP-30X - Phím đàn và màn hình LCD' },
      { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop', alt: 'Roland FP-30X - Góc nhìn tổng thể' },
      { url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&auto=format&fit=crop', alt: 'Roland FP-30X - Chi tiết điều khiển' },
      { url: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=800&auto=format&fit=crop', alt: 'Roland FP-30X - Góc nhìn bên' },
    ],
    attributes: {
      type: 'digital',
      keys: 88,
      polyphony: 256,
      keyAction: 'PHA-4',
      speakers: '22W built-in',
      connectivity: 'Bluetooth, USB',
      origin: 'Indonesia',
      weight: '14.1 kg',
      size: '129 x 28 x 14 cm'
    },
    highlights: [
      '88 phím PHA-4 cảm giác chân thực',
      'Âm thanh SuperNATURAL, 256 polyphony',
      'Bluetooth Audio/MIDI, USB',
      'Loa tích hợp 22W – âm lớn, rõ',
    ],
    gifts: [
      'Pedal sustain DP-10',
      'Adapter chính hãng',
      'Sách hướng dẫn',
    ],
    warrantyMonths: 36,
    shipping: { innerCityFree: true },
    description: `🎹   Roland FP-30X   mang đến trải nghiệm piano kỹ thuật số hiện đại, nhỏ gọn, dễ di chuyển.`,
    videoUrl: '',
  },

  {
    _id: 'p4',
    slug: 'piano-acoustic-kawai-gl10',
    name: 'Piano Acoustic Kawai GL-10',
    sku: 'KA-GL10',
    brand: { name: 'KAWAI', slug: 'kawai' },
    category: { name: 'Piano', slug: 'piano' },
    price: { base: 80_000_000, sale: 80_000_000, currency: 'VND' },
    stock: 0, // hết hàng
    rating: 4.9,
    images: [
      { url: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=800&auto=format&fit=crop', alt: 'Kawai GL-10 - Chi tiết thân đàn' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', alt: 'Kawai GL-10 - Góc nhìn tổng thể' },
      { url: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=800&auto=format&fit=crop', alt: 'Kawai GL-10 - Chi tiết nội thất' },
    ],
    attributes: {
      type: 'grand',
      keys: 88,
      size: '153 cm',
      finish: 'Polished Ebony',
      action: 'Millennium III',
      origin: 'Japan',
      weight: '280 kg',
      dims: '153 x 148 x 99 cm'
    },
    highlights: [
      'Grand piano 153cm – âm lớn, trường độ tốt',
      'Action Millennium III bền bỉ, nhạy',
      'Vật liệu gỗ cao cấp: Spruce, Mahogany',
    ],
    gifts: [
      'Ghế piano điều chỉnh',
      'Bàn đàn cao cấp',
      'Bộ dụng cụ bảo trì',
    ],
    warrantyMonths: 120,
    shipping: { innerCityFree: true },
    description: `🎹   Kawai GL-10   là cây grand piano đẳng cấp cho không gian sang trọng và biểu diễn.`,
    videoUrl: '',
  },

  {
    _id: 'p5',
    slug: 'guitar-acoustic-taylor-214ce',
    name: 'Guitar Acoustic Taylor 214ce',
    sku: 'TA-214CE',
    brand: { name: 'TAYLOR', slug: 'taylor' },
    category: { name: 'Guitar', slug: 'guitar' },
    price: { base: 12_000_000, sale: 10_800_000, currency: 'VND' },
    stock: 6,
    rating: 4.8,
    images: [
      { url: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=800&auto=format&fit=crop', alt: 'Taylor 214ce - Chi tiết thân đàn và pickup' },
      { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop', alt: 'Taylor 214ce - Cần đàn và phím đàn' },
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', alt: 'Taylor 214ce - Đầu đàn và máy lên dây' },
      { url: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=800&auto=format&fit=crop', alt: 'Taylor 214ce - Góc nhìn tổng thể' },
    ],
    attributes: {
      type: 'acoustic-electric',
      strings: 6,
      bodyMaterial: 'Sitka Spruce',
      backSides: 'Sapele',
      neckMaterial: 'Sapele',
      fingerboardMaterial: 'Ebony',
      origin: 'USA'
    },
    highlights: [
      'Dáng Grand Auditorium – cân bằng, dễ ôm',
      'Top Sitka Spruce – tiếng sáng, chi tiết',
      'Expression System 2 – khuếch đại tự nhiên',
      'Cutaway – chơi cao dễ dàng',
    ],
    gifts: [
      'Hộp cứng Taylor',
      'Dây Elixir dự phòng',
      'Cable 3m',
    ],
    warrantyMonths: 36,
    shipping: { innerCityFree: true },
    description: `🎸   Taylor 214ce   – lựa chọn acoustic-electric cao cấp cho biểu diễn và thu âm.`,
    videoUrl: '',
  },

  {
    _id: 'p6',
    slug: 'piano-digital-yamaha-p125',
    name: 'Piano Digital Yamaha P-125',
    sku: 'YA-P125',
    brand: { name: 'YAMAHA', slug: 'yamaha' },
    category: { name: 'Piano', slug: 'piano' },
    price: { base: 18_000_000, sale: 16_200_000, currency: 'VND' },
    stock: 9,
    rating: 4.6,
    images: [
      { url: 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=800&auto=format&fit=crop', alt: 'Yamaha P-125 Digital Piano - Góc nhìn chính' },
      { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop', alt: 'Yamaha P-125 - Phím đàn và màn hình LCD' },
      { url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&auto=format&fit=crop', alt: 'Yamaha P-125 - Góc nhìn tổng thể' },
      { url: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=800&auto=format&fit=crop', alt: 'Yamaha P-125 - Chi tiết điều khiển' },
      { url: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?q=80&w=800&auto=format&fit=crop', alt: 'Yamaha P-125 - Góc nhìn bên' },
    ],
    attributes: {
      type: 'digital',
      keys: 88,
      keyAction: 'GHS',
      polyphony: 192,
      speakers: '14W x2 built-in',
      connectivity: 'USB',
      origin: 'Indonesia',
      weight: '11.8 kg',
      size: '132 x 29 x 16 cm'
    },
    highlights: [
      '88 phím GHS – cảm giác như piano cơ',
      'Pure CF Sound Engine – tiếng grand CFIIIS',
      'Loa tích hợp 14W x2, âm rõ',
      'Dual/Layers, metronome, USB',
    ],
    gifts: [
      'Pedal sustain FC3A',
      'Adapter chính hãng',
      'Cable USB',
    ],
    warrantyMonths: 24,
    shipping: { innerCityFree: true },
    description: `🎹   Yamaha P-125   – piano portable gọn nhẹ, phù hợp học tập & biểu diễn tại nhà.`,
    videoUrl: '',
  },
];

// Helpers
export function getProductBySlug(slug) {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug) {
  return MOCK_PRODUCTS.filter((p) => p.category?.slug === categorySlug);
}

export function listBrands() {
  return Array.from(
    new Set(MOCK_PRODUCTS.map((p) => p.brand?.name).filter(Boolean))
  );
}
