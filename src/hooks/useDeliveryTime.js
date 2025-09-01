// src/hooks/useDeliveryTime.js
import { useState } from 'react';


export function useDeliveryTime() {
const [shipMode, setShipMode] = useState('instock'); // 'instock' | 'schedule'
const [dayOption, setDayOption] = useState('today'); // 'today' | 'tomorrow' | 'custom'
const [customDate, setCustomDate] = useState('');
const [timeSlot, setTimeSlot] = useState('13:00 - 14:00');
const [confirmed, setConfirmed] = useState(false);


const confirm = () => {
if (shipMode === 'schedule') {
if (dayOption === 'custom' && !customDate) return false;
if (!timeSlot) return false;
}
setConfirmed(true);
return true;
};


const payload = {
mode: shipMode,
dayOption,
customDate,
timeSlot,
dateLabel:
shipMode === 'schedule'
? dayOption === 'today'
? 'Hôm nay'
: dayOption === 'tomorrow'
? 'Ngày mai'
: customDate
: 'Hôm nay',
};


return {
shipMode,
setShipMode,
dayOption,
setDayOption,
customDate,
setCustomDate,
timeSlot,
setTimeSlot,
confirmed,
setConfirmed,
confirm,
payload,
};
}