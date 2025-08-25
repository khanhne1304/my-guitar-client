import { Routes, Route } from "react-router-dom";
import publicRoutes from "./routeConfig/publicRoute";

export default function AppRouter() {
  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<div style={{padding:16}}>404</div>} />
    </Routes>
  );
}
