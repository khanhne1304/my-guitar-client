// src/hooks/useCategoryProducts.js
import { useEffect, useState } from 'react';
import { MOCK_PRODUCTS } from '../../src/views/components/Data/dataProduct';


export function useCategoryProducts(categorySlug) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');


    useEffect(() => {
        if (!categorySlug) return;


        let t;
        setLoading(true);
        setErr('');


        // giả lập fetch
        t = setTimeout(() => {
            try {
                const filtered = (MOCK_PRODUCTS || []).filter(
                    (p) => p?.category?.slug === categorySlug
                );
                setProducts(filtered);
            } catch (e) {
                setErr('Không tải được sản phẩm');
            } finally {
                setLoading(false);
            }
        }, 500);


        return () => clearTimeout(t);
    }, [categorySlug]);


    return { products, loading, err };
}