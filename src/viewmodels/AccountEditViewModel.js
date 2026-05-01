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

    // Forum/social-style profile
    bio: "",
    location: "",
    birthday: "",
    education: "",
    website: "",
    facebookUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",

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

          bio: data.bio || "",
          location: data.location || "",
          birthday: data.birthday || "",
          education: data.education || "",
          website: data.website || "",
          facebookUrl: data.facebookUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          tiktokUrl: data.tiktokUrl || "",
        });
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
      } catch (err) {
        console.error("Lỗi khi lấy user:", err);
        const status = err?.response?.status ?? err?.status;
        if (status === 401) {
          setError("Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
        } else if (status === 404) {
          setError("Không tìm thấy API thông tin người dùng (`/users/profile`).");
        } else {
          setError(err?.response?.data?.message || err?.message || "Không thể tải thông tin người dùng.");
        }

        // Fallback: load from localStorage cache so page still works offline
        try {
          const raw = localStorage.getItem("user");
          const cached = raw ? JSON.parse(raw) : null;
          if (cached) {
            setForm((prev) => ({
              ...prev,
              username: cached.username || prev.username || "",
              email: cached.email || prev.email || "",
              fullName: cached.fullName || prev.fullName || "",
              address: cached.address || prev.address || "",
              phone: cached.phone || prev.phone || "",
              avatarUrl: cached.avatarUrl || prev.avatarUrl || "",

              bio: cached.bio || prev.bio || "",
              location: cached.location || prev.location || "",
              birthday: cached.birthday || prev.birthday || "",
              education: cached.education || prev.education || "",
              website: cached.website || prev.website || "",
              facebookUrl: cached.facebookUrl || prev.facebookUrl || "",
              youtubeUrl: cached.youtubeUrl || prev.youtubeUrl || "",
              tiktokUrl: cached.tiktokUrl || prev.tiktokUrl || "",
            }));
            if (cached.avatarUrl) setAvatarPreview(cached.avatarUrl);
          }
        } catch {}
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
      const updated = await updateUserProfileApi(payload);
      try {
        // Keep local cache in sync for places still reading from localStorage
        localStorage.setItem("user", JSON.stringify(updated || payload));
        window.dispatchEvent(new CustomEvent("user:profile-changed"));
      } catch {}
      // Go back to the requested page, then force reload Profile so it reflects latest changes everywhere
      navigate(returnTo, { replace: true });
      if (returnTo === "/profile") {
        try {
          setTimeout(() => window.location.reload(), 0);
        } catch {}
      }
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setError(err?.response?.data?.message || err.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  return { form, setForm, loading, saving, error, handleChange, handleAvatarFileChange, avatarPreview, handleSubmit, navigate, returnTo };
}
