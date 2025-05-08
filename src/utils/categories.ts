// List of countries with consistent format
export const categories = [
  { id: 'jade', name: 'Jade Items' },
  { id: 'antiques', name: 'Antiques' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'art', name: 'Artwork' },
  { id: 'gems', name: 'Precious Gems' },
]

// Helper function to get country name from ID
export const getCategoryNameById = (id: string, defaultName: '' | 'Others' = ''): string => {
  const category = categories.find(c => c.id === id)
  return category ? category.name : defaultName
}

