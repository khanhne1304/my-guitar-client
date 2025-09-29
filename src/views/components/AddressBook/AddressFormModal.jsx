// src/views/components/AddressBook/AddressFormModal.jsx
import { useState, useEffect } from 'react';
import styles from './AddressFormModal.module.css';

export default function AddressFormModal({ address, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    address: address?.address || '',
    city: address?.city || '',
    district: address?.district || '',
    ward: address?.ward || '',
    label: address?.label || 'home',
    customLabel: address?.customLabel || '',
    isDefault: address?.isDefault || false
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load provinces on mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  // Load districts when city changes
  const handleCityChange = async (provinceCode) => {
    setFormData(prev => ({ ...prev, city: "", district: "", ward: "" }));
    
    const selectedProvince = provinces.find((p) => String(p.code) === String(provinceCode));
    setFormData(prev => ({ ...prev, city: selectedProvince?.name || "" }));
    
    setDistricts([]);
    setWards([]);
    
    if (provinceCode) {
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
        );
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (error) {
        console.error('Error loading districts:', error);
      }
    }
  };

  // Load wards when district changes
  const handleDistrictChange = async (districtCode) => {
    const selectedDistrict = districts.find((d) => String(d.code) === String(districtCode));
    setFormData(prev => ({ ...prev, district: selectedDistrict?.name || "", ward: "" }));
    
    setWards([]);
    
    if (districtCode) {
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
        );
        const data = await res.json();
        setWards(data.wards || []);
      } catch (error) {
        console.error('Error loading wards:', error);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^(0|\+84)[3-9]\d{8}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ cụ thể không được để trống';
    }
    
    if (!formData.city) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    }
    
    if (!formData.district) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }
    
    if (formData.label === 'other' && !formData.customLabel.trim()) {
      newErrors.customLabel = 'Vui lòng nhập nhãn tùy chỉnh';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{address ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Họ và tên *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Nhập họ và tên"
              className={errors.fullName ? styles.error : ''}
            />
            {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Số điện thoại *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Nhập số điện thoại"
              className={errors.phone ? styles.error : ''}
            />
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Tỉnh/Thành phố *</label>
              <select
                value={provinces.find(p => p.name === formData.city)?.code || ''}
                onChange={(e) => handleCityChange(e.target.value)}
                className={errors.city ? styles.error : ''}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.city && <span className={styles.errorText}>{errors.city}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Quận/Huyện *</label>
              <select
                value={districts.find(d => d.name === formData.district)?.code || ''}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!districts.length}
                className={errors.district ? styles.error : ''}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.district && <span className={styles.errorText}>{errors.district}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Phường/Xã</label>
              <select
                value={wards.find(w => w.name === formData.ward)?.code || ''}
                onChange={(e) => {
                  const selectedWard = wards.find((w) => String(w.code) === String(e.target.value));
                  handleInputChange('ward', selectedWard?.name || '');
                }}
                disabled={!wards.length}
              >
                <option value="">Chọn phường/xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Nhãn địa chỉ</label>
              <select
                value={formData.label}
                onChange={(e) => {
                  handleInputChange('label', e.target.value);
                  if (e.target.value !== 'other') {
                    handleInputChange('customLabel', '');
                  }
                }}
              >
                <option value="home">Nhà</option>
                <option value="office">Văn phòng</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {formData.label === 'other' && (
            <div className={styles.formGroup}>
              <label>Nhãn tùy chỉnh *</label>
              <input
                type="text"
                value={formData.customLabel}
                onChange={(e) => handleInputChange('customLabel', e.target.value)}
                placeholder="Nhập nhãn tùy chỉnh"
                className={errors.customLabel ? styles.error : ''}
              />
              {errors.customLabel && <span className={styles.errorText}>{errors.customLabel}</span>}
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Địa chỉ cụ thể *</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Số nhà, tên đường..."
              rows={3}
              className={errors.address ? styles.error : ''}
            />
            {errors.address && <span className={styles.errorText}>{errors.address}</span>}
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              />
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelButton}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
