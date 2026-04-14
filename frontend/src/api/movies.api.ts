import api from "./axiosInstance";
import type { Movie, Show } from "../types";

export interface CreateMoviePayload {
  title: string;
  description: string;
  duration: number;
  genre: string;
  rating: string;
  base_price: number;
  poster_url: string;
}

export interface CreateMovieResponse {
  message: string;
  movie: Movie;
}

export const moviesApi = {
  getAll: async (): Promise<Movie[]> => {
    const { data } = await api.get<{ movies: Movie[] }>("/movies");
    return data.movies;
  },

  getById: async (id: number): Promise<Movie> => {
    const { data } = await api.get<{ movie: Movie }>(`/movies/${id}`);
    return data.movie;
  },

  getShows: async (movieId: number): Promise<Show[]> => {
    const { data } = await api.get<{ shows: Show[] }>(
      `/movies/${movieId}/shows`,
    );
    return data.shows;
  },

  create: async (payload: CreateMoviePayload): Promise<CreateMovieResponse> => {
    const { data } = await api.post<CreateMovieResponse>(
      "/movies",
      payload,
    );
    return data;
  },
};
