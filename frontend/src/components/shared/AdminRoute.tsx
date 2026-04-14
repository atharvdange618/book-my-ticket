import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../../stores/authStore"

export function AdminRoute() {
  const { user } = useAuthStore()

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
