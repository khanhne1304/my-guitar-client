// src/hooks/useCategoryProducts.js
import { useEffect, useState } from 'react';
import { productService } from '../services/productService';


export function useCategoryProducts(categorySlug) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        if (!categorySlug) return;

        let t;
        setLoading(true);
        setErr('');


        (async () => {
            try {
                const items = await productService.list({ categorySlug });
                setProducts(items);
            } catch (e) {
                setErr('Không tải được sản phẩm');
            } finally {
                setLoading(false);
            }
        })();


        return () => {};
    }, [categorySlug]);


    return { products, loading, err };
}