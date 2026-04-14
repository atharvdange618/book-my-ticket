import pool from "../config/database.js";

/**
 * Get all bookings (Admin only)
 * GET /api/admin/bookings
 */
export async function getAllBookings(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        b.id,
        b.status,
        b.booking_time,
        b.cancellation_time,
        b.total_price,
        u.email as user_email,
        u.name as user_name,
        s.row_letter,
        s.seat_number,
        sh.show_time,
        sh.screen_number,
        m.title as movie_title
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN bookings_seats bs ON b.id = bs.booking_id
       JOIN seats s ON bs.seat_id = s.id
       JOIN shows sh ON b.show_id = sh.id
       JOIN movies m ON sh.movie_id = m.id
       ORDER BY b.booking_time DESC`,
    );

    // Group bookings by booking_id to combine multiple seats
    const groupedBookings = result.rows.reduce((acc, row) => {
      const existingBooking = acc.find((b) => b.id === row.id);

      if (existingBooking) {
        existingBooking.seats.push({
          row_letter: row.row_letter,
          seat_number: row.seat_number,
        });
      } else {
        acc.push({
          id: row.id,
          status: row.status,
          booking_time: row.booking_time,
          cancellation_time: row.cancellation_time,
          total_price: row.total_price,
          user_email: row.user_email,
          user_name: row.user_name,
          show_time: row.show_time,
          screen_number: row.screen_number,
          movie_title: row.movie_title,
          seats: [
            {
              row_letter: row.row_letter,
              seat_number: row.seat_number,
            },
          ],
        });
      }

      return acc;
    }, []);

    res.json({ bookings: groupedBookings });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Get all users (Admin only)
 * GET /api/admin/users
 */
export async function getAllUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`,
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Delete user (Admin only)
 * DELETE /api/admin/users/:userId
 */
export async function deleteUser(req, res) {
  const { userId } = req.params;

  try {
    // check user exist karta hai ya nhi
    const userCheck = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [userId],
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userCheck.rows[0];

    // delete user (cascade delete will handle related bookings)
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    res.json({
      message: "User deleted successfully",
      deletedUser: {
        id: parseInt(userId),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Get admin statistics (Admin only)
 * GET /api/admin/stats
 */
export async function getStats(req, res) {
  try {
    // Get total users
    const usersResult = await pool.query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total bookings
    const bookingsResult = await pool.query("SELECT COUNT(*) FROM bookings");
    const totalBookings = parseInt(bookingsResult.rows[0].count);

    // Get confirmed bookings
    const confirmedResult = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'",
    );
    const confirmedBookings = parseInt(confirmedResult.rows[0].count);

    // Get cancelled bookings
    const cancelledResult = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'",
    );
    const cancelledBookings = parseInt(cancelledResult.rows[0].count);

    // Get total revenue (counting only confirmed bookings)
    const revenueResult = await pool.query(
      "SELECT COALESCE(SUM(total_price), 0) as revenue FROM bookings WHERE status = 'confirmed'",
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].revenue);

    // Get total movies
    const moviesResult = await pool.query("SELECT COUNT(*) FROM movies");
    const totalMovies = parseInt(moviesResult.rows[0].count);

    // Get total shows
    const showsResult = await pool.query("SELECT COUNT(*) FROM shows");
    const totalShows = parseInt(showsResult.rows[0].count);

    // Get upcoming shows
    const upcomingShowsResult = await pool.query(
      "SELECT COUNT(*) FROM shows WHERE show_time > CURRENT_TIMESTAMP",
    );
    const upcomingShows = parseInt(upcomingShowsResult.rows[0].count);

    // Get recent bookings (last 10)
    const recentBookingsResult = await pool.query(
      `SELECT
        b.id,
        b.status,
        b.booking_time,
        b.total_price,
        u.name as user_name,
        m.title as movie_title,
        sh.show_time
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN shows sh ON b.show_id = sh.id
       JOIN movies m ON sh.movie_id = m.id
       ORDER BY b.booking_time DESC
       LIMIT 10`,
    );

    res.json({
      stats: {
        totalUsers,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        totalMovies,
        totalShows,
        upcomingShows,
      },
      recentBookings: recentBookingsResult.rows,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
