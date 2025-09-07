// CategoryViewModel.js
import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCategoryProducts } from '../hooks/useCategoryProducts';
import { CategoryState } from '../models/categoryModel';

export function useCategoryViewModel() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('default');

  const categorySlug = slug || searchParams.get('category');
  const { products, loading, err } = useCategoryProducts(categorySlug);

  const state = new CategoryState({ slug: categorySlug, products, loading, err });

  const sortedProducts = useMemo(() => {
    const list = [...(state.products || [])];
    const getNow = (p) =>
      p?.price?.sale && p.price.sale !== 0
        ? p.price.sale
        : p?.price?.base || 0;

    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => getNow(a) - getNow(b));
      case 'price-desc':
        return list.sort((a, b) => getNow(b) - getNow(a));
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list;
    }
  }, [state.products, sortBy]);

  return {
    categorySlug: state.slug,
    products: state.products,
    loading: state.loading,
    err: state.err,
    sortBy,
    setSortBy,
    sortedProducts,
  };
}
