import api from "./axiosInstance";
import type { User, AdminBooking, AdminStats, Booking } from "../types";

export interface DeleteUserResponse {
  message: string;
  deletedUser: {
    id: number;
    email: string;
    name: string;
  };
}

export const adminApi = {
  getStats: async (): Promise<{
    stats: AdminStats;
    recentBookings: AdminBooking[];
  }> => {
    const { data } = await api.get<{
      stats: AdminStats;
      recentBookings: AdminBooking[];
    }>("/admin/stats");
    return data;
  },

  getBookings: async (): Promise<AdminBooking[]> => {
    const { data } = await api.get<{ bookings: AdminBooking[] }>(
      "/admin/bookings",
    );
    return data.bookings;
  },

  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get<{ users: User[] }>("/admin/users");
    return data.users;
  },

  deleteUser: async (userId: number): Promise<DeleteUserResponse> => {
    const { data } = await api.delete<DeleteUserResponse>(
      `/admin/users/${userId}`,
    );
    return data;
  },

  getAllBookingsDetail: async (): Promise<Booking[]> => {
    const { data } = await api.get<{ bookings: Booking[] }>("/admin/bookings");
    return data.bookings as Booking[];
  },
};
