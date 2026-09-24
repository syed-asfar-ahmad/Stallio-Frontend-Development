import type { ThemeId } from './types';

export interface SampleThemeProduct {
  id: string;
  name: string;
  price: number;
  compare: number;
  image: string;
  tag: string;
}

export interface SampleThemeData {
  heroImage: string;
  products: SampleThemeProduct[];
}

export const SAMPLE_PREVIEWS: Record<ThemeId, SampleThemeData> = {
  'classic-clean': {
    heroImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    products: [
      {
        id: '1',
        name: 'Pro Performance Training Runner',
        price: 129.0,
        compare: 160.0,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        tag: 'Best Seller',
      },
      {
        id: '2',
        name: 'Aerodynamic Lightweight Cap',
        price: 34.0,
        compare: 45.0,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop',
        tag: 'Sale',
      },
    ],
  },
  'modern-minimal': {
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    products: [
      {
        id: '1',
        name: 'Aurelia Linen Relaxed Blazer',
        price: 240.0,
        compare: 290.0,
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop',
        tag: 'Edition 01',
      },
      {
        id: '2',
        name: 'Sculpted Ceramic Vessel',
        price: 85.0,
        compare: 110.0,
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=600&auto=format&fit=crop',
        tag: 'Limited',
      },
    ],
  },
  'bold-editorial': {
    heroImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    products: [
      {
        id: '1',
        name: 'Neo Streetwear Oversized Hoodie',
        price: 98.0,
        compare: 130.0,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop',
        tag: 'Drop 04',
      },
      {
        id: '2',
        name: 'Industrial Utility Crossbody',
        price: 65.0,
        compare: 85.0,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop',
        tag: 'Popular',
      },
    ],
  },
  'boutique-artisan': {
    heroImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop',
    products: [
      {
        id: '1',
        name: 'Hand-Poured Botanical Candle',
        price: 42.0,
        compare: 50.0,
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop',
        tag: 'Organic',
      },
      {
        id: '2',
        name: 'Artisan Terracotta Espresso Cup',
        price: 28.0,
        compare: 35.0,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
        tag: 'Crafted',
      },
    ],
  },
  'retail-catalog': {
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    products: [
      {
        id: '1',
        name: 'Wireless Noise-Cancelling Headphones',
        price: 189.0,
        compare: 249.0,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
        tag: '-24%',
      },
      {
        id: '2',
        name: 'Smart Fitness Tracker Watch',
        price: 79.0,
        compare: 99.0,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
        tag: 'Top Pick',
      },
    ],
  },
};
