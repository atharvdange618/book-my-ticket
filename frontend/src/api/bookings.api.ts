import api from "./axiosInstance";
import type { Booking } from "../types";

export interface CreateBookingPayload {
  seatIds: number[];
  showId: number;
}

export interface BookingRecord {
  id: number;
  user_id: number;
  show_id: number;
  status: "confirmed" | "cancelled";
  booking_time: string;
  cancellation_time: string | null;
  total_price: string;
}

export interface CreateBookingResponse {
  message: string;
  booking: BookingRecord;
  totalPrice: number;
  seatLabels: string;
}

export interface CancelBookingResponse {
  message: string;
  refundAmount: number;
}

export const bookingsApi = {
  create: async (
    payload: CreateBookingPayload,
  ): Promise<CreateBookingResponse> => {
    const { data } = await api.post<CreateBookingResponse>(
      "/bookings",
      payload,
    );
    return data;
  },

  getMine: async (): Promise<Booking[]> => {
    const { data } = await api.get<{ bookings: Booking[] }>(
      "/bookings/my-bookings",
    );
    return data.bookings;
  },

  cancel: async (id: number): Promise<CancelBookingResponse> => {
    const { data } = await api.delete<CancelBookingResponse>(`/bookings/${id}`);
    return data;
  },
};
