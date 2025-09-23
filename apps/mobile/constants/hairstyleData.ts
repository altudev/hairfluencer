export interface Hairstyle {
  id: string;
  name: string;
  category: string;
  trending: boolean;
  rating: number;
  price?: string;
  image: string; // Now using remote URLs
}

export const hairstyles: Hairstyle[] = [
  {
    id: '1',
    name: 'Pixie Perfection',
    category: 'Short Hair',
    trending: true,
    rating: 4.8,
    price: 'Free',
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/be64cd2931-947e9871d4c77c2507b6.png',
  },
  {
    id: '2',
    name: 'Beach Waves',
    category: 'Long Hair',
    trending: true,
    rating: 4.6,
    price: 'Premium',
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/2beb6a10f5-a3d954e519944b9a2e0e.png',
  },
  {
    id: '3',
    name: 'Classic Bob',
    category: 'Bob Cuts',
    trending: false,
    rating: 4.9,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/caf64ff634-85b3d6d14184ab5b5420.png',
  },
  {
    id: '4',
    name: 'Messy Bun',
    category: 'Updos',
    trending: false,
    rating: 4.7,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/f19fbec6a2-a8286716688b1efc3e0d.png',
  },
  {
    id: '5',
    name: 'French Braid',
    category: 'Braids',
    trending: false,
    rating: 4.8,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/fdc4d1163d-f845c06cbf8e6d217cdc.png',
  },
  {
    id: '6',
    name: 'Layered Cut',
    category: 'Long Hair',
    trending: false,
    rating: 4.5,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/34dec0899e-0ae9c003e72f0c865ff8.png',
  },
  {
    id: '7',
    name: 'Natural Afro',
    category: 'Curly Hair',
    trending: false,
    rating: 4.9,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/721e0d9859-38395ace31b83273673e.png',
  },
  {
    id: '8',
    name: 'High Ponytail',
    category: 'Updos',
    trending: false,
    rating: 4.6,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/7b3ed9f120-e8f99aadc54ffacd9a94.png',
  },
  {
    id: '9',
    name: 'Modern Shag',
    category: 'Medium Hair',
    trending: false,
    rating: 4.8,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/95fc1f0ab0-83aa427db37050c868f3.png',
  },
  {
    id: '10',
    name: 'Top Knot',
    category: 'Updos',
    trending: false,
    rating: 4.4,
    image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/6a01180e69-6cf9671b72cb85de0a7b.png',
  },
];

export const avatarImage = require('../assets/images/avatars/placeholder-avatar.png');