// src/hooks/useProducts.js
import { useEffect, useState } from 'react';
import { MOCK_PRODUCTS } from '../../src/views/components/Data/dataProduct';


export function useProducts() {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [err, setErr] = useState('');


useEffect(() => {
let t;
setLoading(true);
setErr('');


// giả lập fetch, sau này thay bằng API
t = setTimeout(() => {
setProducts(MOCK_PRODUCTS);
setLoading(false);
}, 500);


return () => clearTimeout(t);
}, []);


return { products, loading, err };
}