import { useEffect, useState } from "react";
import { getUserProfileApi, updateUserProfileApi } from "../services/userService";
import { useNavigate, useLocation } from "react-router-dom";

export function useAccountEditViewModel() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    address: "",
    phone: "",

  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get("returnTo") || "/account";

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserProfileApi();
        setForm({
          username: data.username || "",
          email: data.email || "",
          fullName: data.fullName || "",
          address: data.address || "",
          phone: data.phone || "",
        });
      } catch (err) {
        console.error("Lỗi khi lấy user:", err);
        setError("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      // ✅ chỉ gửi đúng các field hồ sơ, không có password
      await updateUserProfileApi(form);
      navigate(returnTo);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setError(err?.response?.data?.message || err.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  return { form, setForm, loading, saving, error, handleChange, handleSubmit, navigate, returnTo };
}
