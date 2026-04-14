import { BrowserRouter, Routes, Route } from "react-router-dom"

import { MainLayout } from "@/components/layout/MainLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { AdminRoute } from "@/components/shared/AdminRoute"

import HomePage from "@/pages/HomePage"
import MoviesPage from "@/pages/movies/MoviesPage"
import MovieDetailPage from "@/pages/movies/MovieDetailPage"
import SeatSelectionPage from "@/pages/shows/SeatSelectionPage"
import MyBookingsPage from "@/pages/bookings/MyBookingsPage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage"
import AdminMoviesPage from "@/pages/admin/AdminMoviesPage"
import AdminShowsPage from "@/pages/admin/AdminShowsPage"
import AdminBookingsPage from "@/pages/admin/AdminBookingsPage"
import AdminUsersPage from "@/pages/admin/AdminUsersPage"
import NotFoundPage from "@/pages/NotFoundPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="movies/:id" element={<MovieDetailPage />} />
          <Route path="shows/:showId" element={<SeatSelectionPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="bookings" element={<MyBookingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/movies" element={<AdminMoviesPage />} />
              <Route path="admin/shows" element={<AdminShowsPage />} />
              <Route path="admin/bookings" element={<AdminBookingsPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
