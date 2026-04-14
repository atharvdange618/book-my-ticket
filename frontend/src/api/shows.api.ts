import api from "./axiosInstance";
import type { Show, Seat } from "../types";

export interface CreateShowPayload {
  movieId: number;
  showTime: string;
  screenNumber: number;
}

export interface CreateShowResponse {
  message: string;
  show: Show;
}

export const showsApi = {
  getById: async (id: number): Promise<Show> => {
    const { data } = await api.get<{ show: Show }>(`/shows/${id}`);
    return data.show;
  },

  getSeats: async (showId: number): Promise<Seat[]> => {
    const { data } = await api.get<{ seats: Seat[] }>(`/shows/${showId}/seats`);
    return data.seats;
  },

  create: async (payload: CreateShowPayload): Promise<CreateShowResponse> => {
    const { data } = await api.post<CreateShowResponse>(
      "/shows",
      payload,
    );
    return data;
  },
};
