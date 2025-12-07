export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface AddFavoritesDto {
  productIds: string[];
}

export interface AddFavoritesResponse {
  message: string;
  favoriteIds: string[];
}

