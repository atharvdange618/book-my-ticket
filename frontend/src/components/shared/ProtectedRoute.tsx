import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"

export function ProtectedRoute() {
  const { token } = useAuthStore()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
