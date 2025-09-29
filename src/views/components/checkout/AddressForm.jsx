import { useEffect, useState } from "react";
import styles from "../../pages/CheckoutPage/CheckoutPage.module.css";

export default function AddressForm({ form, setForm }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Fetch danh sách tỉnh khi mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  // Khi chọn tỉnh -> fetch huyện
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    setForm({ ...form, city: "", district: "", ward: "" });

    const selectedProvince = provinces.find((p) => String(p.code) === String(provinceCode));
    setForm({ ...form, city: selectedProvince?.name || "" });

    setDistricts([]);
    setWards([]);
    if (provinceCode) {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await res.json();
      setDistricts(data.districts || []);
    }
  };

  // Khi chọn huyện -> fetch xã
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const selectedDistrict = districts.find((d) => String(d.code) === String(districtCode));
    setForm({ ...form, district: selectedDistrict?.name || "", ward: "" });

    setWards([]);
    if (districtCode) {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await res.json();
      setWards(data.wards || []);
    }
  };

  // Khi chọn xã
  const handleWardChange = (e) => {
    const selectedWard = wards.find((w) => String(w.code) === String(e.target.value));
    setForm({ ...form, ward: selectedWard?.name || "" });
  };

  return (
    <div className={styles["checkout__form"]}>
      {/* Họ tên */}
      <input
        className={styles["checkout__input"]}
        placeholder="Nhập họ và tên"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      {/* Số điện thoại */}
      <input
        className={styles["checkout__input"]}
        placeholder="Số điện thoại"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      {/* Email */}
      <input
        className={styles["checkout__input"]}
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      {/* Dropdown tỉnh */}
      <select
        className={styles["checkout__input"]}
        onChange={handleProvinceChange}
        defaultValue=""
      >
        <option value="">Chọn tỉnh / thành phố</option>
        {provinces.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Dropdown huyện */}
      <select
        className={styles["checkout__input"]}
        onChange={handleDistrictChange}
        disabled={!districts.length}
        defaultValue=""
      >
        <option value="">Chọn quận / huyện</option>
        {districts.map((d) => (
          <option key={d.code} value={d.code}>
            {d.name}
          </option>
        ))}
      </select>

      {/* Dropdown xã */}
      <select
        className={styles["checkout__input"]}
        onChange={handleWardChange}
        disabled={!wards.length}
        defaultValue=""
      >
        <option value="">Chọn phường / xã</option>
        {wards.map((w) => (
          <option key={w.code} value={w.code}>
            {w.name}
          </option>
        ))}
      </select>

      {/* Địa chỉ cụ thể */}
      <input
        className={styles["checkout__input"]}
        placeholder="Số nhà, tên đường"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
    </div>
  );
}
