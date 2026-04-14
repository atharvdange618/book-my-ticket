import pool from "../config/database.js";
import {
  sendBookingConfirmation,
  sendCancellationEmail,
} from "../utils/emailHelper.js";

/**
 * Create a new booking
 * POST /api/bookings
 */
export async function createBooking(req, res) {
  const { seatIds, showId } = req.body;
  const userId = req.user.userId;

  if (req.user.role === "admin") {
    return res.status(403).json({
      error:
        "Admin accounts cannot book tickets. Please create a regular user account.",
    });
  }

  const conn = await pool.connect();

  try {
    await conn.query("BEGIN");

    // get show details with movie info
    const showResult = await conn.query(
      `SELECT s.*, m.title, m.base_price
       FROM shows s
       JOIN movies m ON s.movie_id = m.id
       WHERE s.id = $1`,
      [showId],
    );

    if (showResult.rows.length === 0) {
      await conn.query("ROLLBACK");
      return res.status(404).json({ error: "Show not found" });
    }

    const show = showResult.rows[0];

    // check if show time khatam hua ya nhi
    if (new Date(show.show_time) < new Date()) {
      await conn.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Cannot book seats for past shows" });
    }

    // lock and verify all seats are available
    const seatsResult = await conn.query(
      `SELECT * FROM seats
       WHERE id = ANY($1) AND show_id = $2 AND isbooked = FALSE
       FOR UPDATE`,
      [seatIds, showId],
    );

    if (seatsResult.rows.length !== seatIds.length) {
      await conn.query("ROLLBACK");
      return res.status(409).json({
        error: "One or more selected seats are already booked or invalid",
      });
    }

    const seats = seatsResult.rows;

    // calculate total price based on seat types and multipliers
    const totalPrice = seats.reduce((sum, seat) => {
      const seatPrice = show.base_price * parseFloat(seat.price_multiplier);
      return sum + seatPrice;
    }, 0);

    // seats ko booked mark karo
    await conn.query("UPDATE seats SET isbooked = TRUE WHERE id = ANY($1)", [
      seatIds,
    ]);

    // available seats count ko update karo
    await conn.query(
      "UPDATE shows SET available_seats = available_seats - $1 WHERE id = $2",
      [seatIds.length, showId],
    );

    // create a single booking record with total price
    const bookingResult = await conn.query(
      `INSERT INTO bookings (user_id, show_id, status, total_price)
       VALUES ($1, $2, 'confirmed', $3)
       RETURNING *`,
      [userId, showId, totalPrice],
    );

    const booking = bookingResult.rows[0];

    // create entries in bookings_seats junction table
    const bookingSeatPromises = seats.map((seat) =>
      conn.query(
        `INSERT INTO bookings_seats (booking_id, seat_id)
         VALUES ($1, $2)`,
        [booking.id, seat.id],
      ),
    );

    await Promise.all(bookingSeatPromises);

    await conn.query("COMMIT");

    // get user details for email
    const userResult = await pool.query(
      "SELECT email, name FROM users WHERE id = $1",
      [userId],
    );

    const user = userResult.rows[0];

    // seat labels format karo mere bhai (e.g., "A1, A2, B3")
    const seatLabels = seats
      .map((s) => `${s.row_letter}${s.seat_number}`)
      .join(", ");

    // send confirmation email (don't wait for it, fire and forget boiii)
    sendBookingConfirmation({
      to: user.email,
      userName: user.name,
      movieTitle: show.title,
      showTime: show.show_time,
      seats: seatLabels,
      totalPrice,
      bookingId: booking.id,
    }).catch((err) => console.error("Email send failed:", err));

    res.status(201).json({
      message: "Booking successful",
      booking,
      totalPrice,
      seatLabels,
    });
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Booking error:", error);
    res.status(500).json({ error: "Server error during booking" });
  } finally {
    conn.release();
  }
}

/**
 * Get user's bookings
 * GET /api/bookings/my-bookings
 */
export async function getUserBookings(req, res) {
  const userId = req.user.userId;

  if (req.user.role === "admin") {
    return res.status(403).json({
      error:
        "Admin accounts cannot book tickets. Please create a regular user account.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT 
        b.id,
        b.status,
        b.booking_time,
        b.cancellation_time,
        b.total_price,
        s.row_letter,
        s.seat_number,
        s.seat_type,
        sh.show_time,
        sh.screen_number,
        m.title,
        m.poster_url,
        m.duration,
        m.genre,
        m.rating
       FROM bookings b
       JOIN bookings_seats bs ON b.id = bs.booking_id
       JOIN seats s ON bs.seat_id = s.id
       JOIN shows sh ON b.show_id = sh.id
       JOIN movies m ON sh.movie_id = m.id
       WHERE b.user_id = $1
       ORDER BY sh.show_time DESC, b.id DESC`,
      [userId],
    );

    // group bookings by booking_id (since multiple seats bhi toh book ho sakti hai ek booking mein)
    const groupedBookings = result.rows.reduce((acc, row) => {
      const existingBooking = acc.find((b) => b.id === row.id);

      if (existingBooking) {
        existingBooking.seats.push({
          row_letter: row.row_letter,
          seat_number: row.seat_number,
          seat_type: row.seat_type,
        });
      } else {
        acc.push({
          id: row.id,
          status: row.status,
          booking_time: row.booking_time,
          cancellation_time: row.cancellation_time,
          total_price: row.total_price,
          show_time: row.show_time,
          screen_number: row.screen_number,
          movie: {
            title: row.title,
            poster_url: row.poster_url,
            duration: row.duration,
            genre: row.genre,
            rating: row.rating,
          },
          seats: [
            {
              row_letter: row.row_letter,
              seat_number: row.seat_number,
              seat_type: row.seat_type,
            },
          ],
        });
      }

      return acc;
    }, []);

    res.json({ bookings: groupedBookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Cancel a booking
 * DELETE /api/bookings/:id
 */
export async function cancelBooking(req, res) {
  const { id } = req.params;
  const userId = req.user.userId;

  if (req.user.role === "admin") {
    return res.status(403).json({
      error: "Admin accounts cannot have bookings.",
    });
  }

  const conn = await pool.connect();

  try {
    await conn.query("BEGIN");

    // get booking with show and seat details
    const bookingResult = await conn.query(
      `SELECT b.*, sh.show_time, sh.id as show_id, m.title, m.base_price
       FROM bookings b
       JOIN shows sh ON b.show_id = sh.id
       JOIN movies m ON sh.movie_id = m.id
       WHERE b.id = $1 AND b.user_id = $2
       FOR UPDATE`,
      [id, userId],
    );

    // get all seats for this booking
    const seatsResult = await conn.query(
      `SELECT s.id, s.row_letter, s.seat_number
       FROM seats s
       JOIN bookings_seats bs ON s.id = bs.seat_id
       WHERE bs.booking_id = $1`,
      [id],
    );

    if (bookingResult.rows.length === 0) {
      await conn.query("ROLLBACK");
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookingResult.rows[0];
    const seats = seatsResult.rows;

    if (seats.length === 0) {
      await conn.query("ROLLBACK");
      return res.status(404).json({ error: "Booking seats not found" });
    }

    // check if booking is already cancelled
    if (booking.status === "cancelled") {
      await conn.query("ROLLBACK");
      return res.status(400).json({ error: "Booking already cancelled" });
    }

    // check if show time has passed
    if (new Date(booking.show_time) < new Date()) {
      await conn.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Cannot cancel booking for past shows" });
    }

    // update booking status
    await conn.query(
      `UPDATE bookings
       SET status = 'cancelled', cancellation_time = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id],
    );

    // mark all seats as available
    const seatIds = seats.map((s) => s.id);
    await conn.query("UPDATE seats SET isbooked = FALSE WHERE id = ANY($1)", [
      seatIds,
    ]);

    // update available seats count
    await conn.query(
      "UPDATE shows SET available_seats = available_seats + $1 WHERE id = $2",
      [seats.length, booking.show_id],
    );

    await conn.query("COMMIT");

    // get user details for email
    const userResult = await pool.query(
      "SELECT email, name FROM users WHERE id = $1",
      [userId],
    );

    const user = userResult.rows[0];

    // format seat labels
    const seatLabels = seats
      .map((s) => `${s.row_letter}${s.seat_number}`)
      .join(", ");

    // send cancellation email (don't wait for it, fire and forget boiii)
    sendCancellationEmail({
      to: user.email,
      userName: user.name,
      movieTitle: booking.title,
      showTime: booking.show_time,
      seats: seatLabels,
      refundAmount: booking.total_price,
      bookingId: booking.id,
    }).catch((err) => console.error("Email send failed:", err));

    res.json({
      message: "Booking cancelled successfully",
      refundAmount: booking.total_price,
    });
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Cancel booking error:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
}
