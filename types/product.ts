export interface Product {
  id: string;
  name: string;
  price: number;
  tags: string[];
}

export interface AddFavoritesDto {
  productIds: string[];
}

export interface AddFavoritesResponse {
  message: string;
  favoriteIds: string[];
}

