'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch all products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: api.getAllProducts,
  });

  // Fetch favorites to initialize local state
  const { data: favoritesData = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: api.getFavorites,
  });

  // Initialize local favorites from server data
  useEffect(() => {
    if (favoritesData.length > 0) {
      setLocalFavorites(new Set(favoritesData.map(p => p.id)));
    }
  }, [favoritesData]);

  // Add favorites mutation
  const addFavoritesMutation = useMutation({
    mutationFn: (productIds: string[]) => api.addFavorites(productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().startsWith(query)
    );
  }, [products, searchQuery]);

  const handleToggleFavorite = (productId: string) => {
    const newFavorites = new Set(localFavorites);
    
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    
    setLocalFavorites(newFavorites);
    addFavoritesMutation.mutate(Array.from(newFavorites));
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          Products
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Browse our collection and save your favorites
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
          />
        </div>
      </div>

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <div className="mb-4 text-6xl">📦</div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {searchQuery ? 'No products found matching your search' : 'No products available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
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
