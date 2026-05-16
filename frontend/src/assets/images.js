// Maps image_key → real Unsplash photo URL
// All images are free-to-use via Unsplash
const IMAGE_MAP = {
  // Footwear Men
  'shoe-men-1': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'shoe-men-2': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
  'shoe-men-3': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
  // Footwear Women
  'shoe-women-1': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80',
  'shoe-women-2': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
  // Watches Men
  'watch-men-1': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
  'watch-men-2': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  'watch-men-3': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
  // Watches Women
  'watch-women-1': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80',
  'watch-women-2': 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=600&q=80',
  // Wall Clocks
  'clock-1': 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&q=80',
  'clock-2': 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=600&q=80',
  'clock-3': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  'clock-4': 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&q=80',
  // Perfumes
  'perfume-1': 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
  'perfume-2': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
  'perfume-3': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80',
  'perfume-4': 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80',
  'perfume-5': 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&q=80',
  'perfume-6': 'https://images.unsplash.com/photo-1600612253971-57b6b5e8c4e0?w=600&q=80',
};

export const getImage = (key) =>
  IMAGE_MAP[key] || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80`;

export default IMAGE_MAP;
