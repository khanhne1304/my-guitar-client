// src/hooks/useDeliveryState.js
import { useMemo, useState, useEffect } from 'react';


export function useDeliveryState() {
const [mode, setMode] = useState('delivery'); // 'delivery' | 'pickup'
const [shipMethod, setShipMethod] = useState('standard');
const [delivery, setDelivery] = useState(null);


useEffect(() => {
try {
const raw = localStorage.getItem('deliveryTime');
setDelivery(raw ? JSON.parse(raw) : null);
} catch {
setDelivery(null);
}
}, []);


return { mode, setMode, shipMethod, setShipMethod, delivery };
}