'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

export default function FavoritesPage() {
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: api.getFavorites,
  });

  // Initialize local favorites from server data
  useEffect(() => {
    if (favorites.length > 0) {
      setLocalFavorites(new Set(favorites.map(p => p.id)));
    }
  }, [favorites]);

  // Add/update favorites mutation
  const updateFavoritesMutation = useMutation({
    mutationFn: (productIds: string[]) => api.addFavorites(productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleToggleFavorite = (productId: string) => {
    const newFavorites = new Set(localFavorites);
    
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    
    setLocalFavorites(newFavorites);
    updateFavoritesMutation.mutate(Array.from(newFavorites));
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Heart className="h-8 w-8 fill-red-500 text-red-500" />
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Your Favorites
          </h1>
        </div>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Products you&apos;ve saved for later
        </p>
      </div>

      {/* Favorites Grid */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <Heart className="mb-4 h-16 w-16 text-zinc-300 dark:text-zinc-700" />
          <p className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            No favorites yet
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Start adding products to your favorites from the products page
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={localFavorites.has(product.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </main>
  );
}

