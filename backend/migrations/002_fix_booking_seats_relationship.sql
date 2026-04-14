-- Migration: Fix booking-seats relationship
-- This migration changes the bookings table to support multiple seats per booking

-- Step 1: Create a junction table for bookings and seats
CREATE TABLE bookings_seats (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id INTEGER NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    UNIQUE(seat_id), -- A seat can only belong to one booking
    UNIQUE(booking_id, seat_id) -- Prevent duplicate entries
);

-- Step 2: Drop the seat_id column from bookings table
-- But first, migrate existing data to the junction table
INSERT INTO bookings_seats (booking_id, seat_id)
SELECT id, seat_id FROM bookings WHERE seat_id IS NOT NULL;

-- Step 3: Now drop the seat_id column from bookings
ALTER TABLE bookings DROP COLUMN seat_id;

-- Step 4: Create index for better query performance
CREATE INDEX idx_bookings_seats_booking_id ON bookings_seats(booking_id);
CREATE INDEX idx_bookings_seats_seat_id ON bookings_seats(seat_id);
