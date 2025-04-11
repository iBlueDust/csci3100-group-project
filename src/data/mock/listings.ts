// Mock marketplace listings that will be used across components
export const mockListings = [
  {
    id: 1,
    title: 'Ancient Jade Pendant',
    description: 'Beautiful hand-carved jade pendant from the Ming Dynasty era. Certified authentic.',
    price: '$850',
    seller: 'jade_master',
    rating: 4.8,
    reviews: 32,
    image: '', // In a real app, you'd add image URLs
    category: 'jade',
    location: 'Hong Kong',
    listed: '3 days ago'
  },
  {
    id: 2,
    title: 'Rare Artifact',
    description: 'Elegant blue and white porcelain vase from the Qing Dynasty. Excellent condition.',
    price: '$1,200',
    seller: 'jade_collector',
    rating: 4.9,
    reviews: 45,
    image: '',
    category: 'antiques',
    location: 'Beijing',
    listed: '5 hours ago'
  },
  {
    id: 3,
    title: 'Vintage Item',
    description: 'Stunning emerald bracelet with silver setting. Professionally appraised.',
    price: '$800',
    seller: 'antique_lover',
    rating: 4.7,
    reviews: 18,
    image: '',
    category: 'gems',
    location: 'Shanghai',
    listed: '1 day ago'
  },
  {
    id: 4,
    title: 'Limited Edition',
    description: 'Detailed bronze Buddha statue with gold leaf accents. Ming Dynasty style.',
    price: '$450',
    seller: 'treasure_hunter',
    rating: 4.6,
    reviews: 12,
    image: '',
    category: 'antiques',
    location: 'Taiwan',
    listed: '2 days ago'
  },
  {
    id: 5,
    title: 'Jade Elephant Figurine',
    description: 'Hand-carved jade elephant with intricate details. Symbol of good fortune.',
    price: '$420',
    seller: 'jade_enthusiast',
    rating: 4.9,
    reviews: 27,
    image: '',
    category: 'jade',
    location: 'Singapore',
    listed: '1 day ago'
  },
  {
    id: 6,
    title: 'Calligraphy Scroll',
    description: 'Beautiful handwritten calligraphy on traditional rice paper. Signed by the artist.',
    price: '$350',
    seller: 'art_collector',
    rating: 4.8,
    reviews: 15,
    image: '',
    category: 'art',
    location: 'Hong Kong',
    listed: '4 days ago'
  },
  {
    id: 7,
    title: 'Sapphire Pendant',
    description: 'Elegant sapphire pendant with diamond accents. Great for special occasions.',
    price: '$1,100',
    seller: 'gem_specialist',
    rating: 5.0,
    reviews: 22,
    image: '',
    category: 'gems',
    location: 'Macau',
    listed: '3 days ago'
  },
  {
    id: 8,
    title: 'Coin Collection',
    description: 'Rare collection of ancient Chinese coins from various dynasties. Great investment.',
    price: '$2,200',
    seller: 'numismatist',
    rating: 4.9,
    reviews: 31,
    image: '',
    category: 'collectibles',
    location: 'Beijing',
    listed: '1 week ago'
  }
];

// Function to get recent listings (first 4 items by default)
export const getRecentListings = (count: number = 4) => {
  return mockListings.slice(0, count);
};
