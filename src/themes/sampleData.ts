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
  'noir-luxe': {
    heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    products: [
      {
        id: '1',
        name: 'Monochrome Chronograph Obsidian Watch',
        price: 480.0,
        compare: 550.0,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
        tag: 'Prestige',
      },
      {
        id: '2',
        name: 'Solid 18k Champagne Gold Band',
        price: 320.0,
        compare: 390.0,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
        tag: 'Exclusive',
      },
    ],
  },
  'pacific-fresh': {
    heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
    products: [
      {
        id: '1',
        name: 'Organic Sea Kelp Revitalizing Serum',
        price: 54.0,
        compare: 68.0,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
        tag: 'Wildcrafted',
      },
      {
        id: '2',
        name: 'Hydrating Jade Essence Facial Mist',
        price: 36.0,
        compare: 45.0,
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop',
        tag: 'Organic',
      },
    ],
  },
};