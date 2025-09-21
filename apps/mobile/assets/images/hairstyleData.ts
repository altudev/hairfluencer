export interface Hairstyle {
  id: string;
  name: string;
  category: string;
  trending: boolean;
  rating: number;
  price?: string;
  image: any; // Using require() for local images
}

export const hairstyles: Hairstyle[] = [
  {
    id: '1',
    name: 'Sunset Waves',
    category: 'Long Hair',
    trending: true,
    rating: 4.9,
    price: 'Free',
    image: require('./hairstyles/placeholder1.jpg'),
  },
  {
    id: '2',
    name: 'Sleek Frost',
    category: 'Short Hair',
    trending: true,
    rating: 4.8,
    price: 'Premium',
    image: require('./hairstyles/placeholder2.jpg'),
  },
  {
    id: '3',
    name: 'Golden Layers',
    category: 'Medium Hair',
    trending: false,
    rating: 4.7,
    image: require('./hairstyles/placeholder3.jpg'),
  },
  {
    id: '4',
    name: 'Modern Bob',
    category: 'Bob Cuts',
    trending: false,
    rating: 4.9,
    image: require('./hairstyles/placeholder4.jpg'),
  },
  {
    id: '5',
    name: 'Braided Crown',
    category: 'Braids',
    trending: false,
    rating: 4.8,
    image: require('./hairstyles/placeholder5.jpg'),
  },
  {
    id: '6',
    name: 'Undercut Style',
    category: 'Men',
    trending: false,
    rating: 4.7,
    image: require('./hairstyles/placeholder6.jpg'),
  },
  {
    id: '7',
    name: 'Natural Curls',
    category: 'Curly Hair',
    trending: false,
    rating: 4.9,
    image: require('./hairstyles/placeholder7.jpg'),
  },
  {
    id: '8',
    name: 'Classic Fade',
    category: 'Men',
    trending: false,
    rating: 4.8,
    image: require('./hairstyles/placeholder8.jpg'),
  },
  {
    id: '9',
    name: 'Pixie Cut',
    category: 'Short Hair',
    trending: false,
    rating: 4.7,
    image: require('./hairstyles/placeholder9.jpg'),
  },
  {
    id: '10',
    name: 'Beach Waves',
    category: 'Long Hair',
    trending: false,
    rating: 4.9,
    image: require('./hairstyles/placeholder10.jpg'),
  },
];

export const avatarImage = require('./avatars/placeholder-avatar.jpg');