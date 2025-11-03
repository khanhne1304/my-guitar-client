import { useEffect, useState } from "react";
import styles from "../../pages/CheckoutPage/CheckoutPage.module.css";

export default function AddressForm({ form, setForm }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");

  // Fetch danh sách tỉnh khi mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/", {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(setProvinces)
      .catch((error) => {
        console.error('Error loading provinces:', error);
        setProvinces([]);
      });
  }, []);

  // Tìm mã tỉnh từ tên tỉnh khi form.city thay đổi (khi chỉnh sửa địa chỉ)
  useEffect(() => {
    if (form.city && provinces.length > 0) {
      const province = provinces.find((p) => p.name === form.city);
      if (province) {
        const provinceCode = String(province.code);
        if (selectedProvinceCode !== provinceCode) {
          setSelectedProvinceCode(provinceCode);
        }
      }
    } else if (!form.city && selectedProvinceCode) {
      setSelectedProvinceCode("");
    }
  }, [form.city, provinces, selectedProvinceCode]);

  // Tải quận/huyện khi có mã tỉnh (bao gồm khi chỉnh sửa địa chỉ)
  useEffect(() => {
    if (selectedProvinceCode && provinces.length > 0) {
      const loadDistricts = async () => {
        try {
          const res = await fetch(
            `https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`,
            {
              method: 'GET',
              mode: 'cors',
              headers: {
                'Accept': 'application/json',
              },
            }
          );
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setDistricts(data.districts || []);
        } catch (error) {
          console.error('Error loading districts:', error);
          setDistricts([]);
        }
      };
      loadDistricts();
    } else if (!selectedProvinceCode) {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvinceCode, provinces]);

  // Tìm mã quận từ tên quận khi form.district thay đổi (khi chỉnh sửa địa chỉ)
  useEffect(() => {
    if (form.district && districts.length > 0) {
      const district = districts.find((d) => d.name === form.district);
      if (district) {
        const districtCode = String(district.code);
        if (selectedDistrictCode !== districtCode) {
          setSelectedDistrictCode(districtCode);
        }
      }
    } else if (!form.district && selectedDistrictCode) {
      setSelectedDistrictCode("");
    }
  }, [form.district, districts, selectedDistrictCode]);

  // Tải phường/xã khi có mã quận (bao gồm khi chỉnh sửa địa chỉ)
  useEffect(() => {
    if (selectedDistrictCode && districts.length > 0) {
      const loadWards = async () => {
        try {
          const res = await fetch(
            `https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`,
            {
              method: 'GET',
              mode: 'cors',
              headers: {
                'Accept': 'application/json',
              },
            }
          );
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setWards(data.wards || []);
        } catch (error) {
          console.error('Error loading wards:', error);
          setWards([]);
        }
      };
      loadWards();
    } else if (!selectedDistrictCode) {
      setWards([]);
    }
  }, [selectedDistrictCode, districts]);

  // Khi chọn tỉnh -> fetch huyện
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    setSelectedProvinceCode(provinceCode);
    setSelectedDistrictCode("");
    
    const selectedProvince = provinces.find((p) => String(p.code) === String(provinceCode));
    setForm({ ...form, city: selectedProvince?.name || "", district: "", ward: "" });

    setDistricts([]);
    setWards([]);
    if (provinceCode) {
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
          {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
            },
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (error) {
        console.error('Error loading districts:', error);
        setDistricts([]);
      }
    }
  };

  // Khi chọn huyện -> fetch xã
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    setSelectedDistrictCode(districtCode);
    
    const selectedDistrict = districts.find((d) => String(d.code) === String(districtCode));
    setForm({ ...form, district: selectedDistrict?.name || "", ward: "" });

    setWards([]);
    if (districtCode) {
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
          {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
            },
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setWards(data.wards || []);
      } catch (error) {
        console.error('Error loading wards:', error);
        setWards([]);
      }
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
        value={selectedProvinceCode}
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
        value={selectedDistrictCode}
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
        value={wards.find((w) => w.name === form.ward)?.code || ""}
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
