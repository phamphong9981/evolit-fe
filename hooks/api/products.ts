import type { Product, AddFavoritesDto, AddFavoritesResponse } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const productsApi = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search products');
    return response.json();
  },

  getFavorites: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/favorites`);
    if (!response.ok) throw new Error('Failed to fetch favorites');
    return response.json();
  },

  addFavorites: async (productIds: string[]): Promise<AddFavoritesResponse> => {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds } as AddFavoritesDto),
    });
    if (!response.ok) throw new Error('Failed to add favorites');
    return response.json();
  },
};

