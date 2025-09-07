// AccountViewModel.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountUser } from "../models/accountModel";

export function useAccountViewModel() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? new AccountUser(JSON.parse(raw)) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("vi-VN", {
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const val = (v) => (v && String(v).trim() ? v : "—");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return {
    user,
    navigate,
    fmtDate,
    val,
    handleLogout,
  };
}
