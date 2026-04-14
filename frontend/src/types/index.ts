export type UserRole = "user" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  genre: string;
  rating: string;
  poster_url: string;
  base_price: string;
  created_at?: string;
}

export type SeatType = "regular" | "vip" | "wheelchair";
export type BookingStatus = "confirmed" | "cancelled";

export interface Show {
  id: number;
  movie_id: number;
  show_time: string;
  screen_number: number;
  available_seats: number;
  created_at?: string;
  title?: string;
  description?: string;
  duration?: number;
  genre?: string;
  rating?: string;
  poster_url?: string;
  base_price?: string;
}

export interface Seat {
  id: number;
  show_id?: number;
  row_letter: string;
  seat_number: number;
  isbooked: boolean;
  seat_type: SeatType;
  price_multiplier: string;
  booking_id?: number;
  booking_status?: BookingStatus;
}

export interface BookingSeat {
  row_letter: string;
  seat_number: string;
  seat_type: SeatType;
}

export interface Booking {
  id: number;
  status: BookingStatus;
  booking_time: string;
  cancellation_time?: string;
  total_price: string;
  show_time: string;
  screen_number: number;
  movie: {
    title: string;
    poster_url: string;
    duration: number;
    genre: string;
    rating: string;
  };
  seats: BookingSeat[];
}

export interface AdminBooking {
  id: number;
  status: BookingStatus;
  booking_time: string;
  cancellation_time?: string;
  total_price: string;
  user_email: string;
  user_name: string;
  seats: Array<{
    row_letter: string;
    seat_number: number;
  }>;
  show_time: string;
  screen_number: number;
  movie_title: string;
}

export interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: string;
  totalMovies: number;
  totalShows: number;
  upcomingShows: number;
}
