'use client';

import { Heart } from 'lucide-react';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
}

export function ProductCard({ product, isFavorite, onToggleFavorite }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-6xl text-zinc-300 dark:text-zinc-600">📦</div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {product.name}
          </h3>
          <button
            onClick={() => onToggleFavorite(product.id)}
            className={cn(
              'rounded-full p-2 transition-colors',
              isFavorite
                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
            )}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn('h-5 w-5', isFavorite && 'fill-current')}
            />
          </button>
        </div>
        <p className="mb-4 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
          {product.description}
        </p>
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          ${product.price.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

