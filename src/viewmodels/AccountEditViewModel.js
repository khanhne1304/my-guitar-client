import { useEffect, useState } from "react";
import { getUserProfileApi, updateUserProfileApi, uploadAvatarApi } from "../services/userService";
import { useNavigate, useLocation } from "react-router-dom";

export function useAccountEditViewModel() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    address: "",
    phone: "",
    avatarUrl: "",

  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
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
          avatarUrl: data.avatarUrl || "",
        });
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
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

  const handleAvatarFileChange = (file) => {
    setAvatarFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview(form.avatarUrl || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      let avatarUrl = form.avatarUrl;
      if (avatarFile) {
        const res = await uploadAvatarApi(avatarFile);
        avatarUrl = res?.avatarUrl || avatarUrl;
      }
      const payload = { ...form, avatarUrl };
      await updateUserProfileApi(payload);
      navigate(returnTo);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setError(err?.response?.data?.message || err.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  return { form, setForm, loading, saving, error, handleChange, handleAvatarFileChange, avatarPreview, handleSubmit, navigate, returnTo };
}
