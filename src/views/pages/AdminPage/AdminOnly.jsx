import { useAuth } from "../../../context/AuthContext";
import NotFoundPage from "../NotFoundPage/NotFoundPage";

export default function AdminOnly({ children }) {
  const { user, authChecked } = useAuth();

  if (!authChecked) return null;

  if (!user || user.role !== "admin") {
    return <NotFoundPage />;
  }

  return children;
}
