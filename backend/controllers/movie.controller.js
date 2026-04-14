import pool from "../config/database.js";

/**
 * Get all movies
 * GET /api/movies
 */
export async function getAllMovies(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM movies ORDER BY created_at DESC",
    );

    res.json({ movies: result.rows });
  } catch (error) {
    console.error("Get movies error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Get movie by ID
 * GET /api/movies/:id
 */
export async function getMovieById(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.json({ movie: result.rows[0] });
  } catch (error) {
    console.error("Get movie error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Get shows for a movie
 * GET /api/movies/:id/shows
 */
export async function getShowsByMovie(req, res) {
  const { id } = req.params;

  try {
    // verify movie exists
    const movieCheck = await pool.query("SELECT id FROM movies WHERE id = $1", [
      id,
    ]);

    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // get all shows for this movie
    const result = await pool.query(
      "SELECT * FROM shows WHERE movie_id = $1 ORDER BY show_time ASC",
      [id],
    );

    res.json({ shows: result.rows });
  } catch (error) {
    console.error("Get shows error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Get show details by ID
 * GET /api/shows/:id
 */
export async function getShowById(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT s.*, m.title, m.description, m.duration, m.genre, m.rating, m.poster_url, m.base_price
       FROM shows s
       JOIN movies m ON s.movie_id = m.id
       WHERE s.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Show not found" });
    }

    res.json({ show: result.rows[0] });
  } catch (error) {
    console.error("Get show error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Get seats for a show
 * GET /api/shows/:id/seats
 */
export async function getSeatsForShow(req, res) {
  const { id } = req.params;

  try {
    // verify show exists
    const showCheck = await pool.query("SELECT id FROM shows WHERE id = $1", [
      id,
    ]);

    if (showCheck.rows.length === 0) {
      return res.status(404).json({ error: "Show not found" });
    }

    // get all seats for this show
    const result = await pool.query(
      `SELECT s.*, b.id as booking_id, b.status as booking_status
       FROM seats s
       LEFT JOIN bookings_seats bs ON s.id = bs.seat_id
       LEFT JOIN bookings b ON bs.booking_id = b.id AND b.status = 'confirmed'
       WHERE s.show_id = $1
       ORDER BY s.row_letter, s.seat_number`,
      [id],
    );

    res.json({ seats: result.rows });
  } catch (error) {
    console.error("Get seats error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Create a new movie (Admin only)
 * POST /api/movies
 */
export async function createMovie(req, res) {
  const {
    title,
    description,
    duration,
    genre,
    rating,
    base_price,
    poster_url,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO movies (title, description, duration, genre, rating, base_price, poster_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, duration, genre, rating, base_price, poster_url],
    );

    res.status(201).json({
      message: "Movie created successfully",
      movie: result.rows[0],
    });
  } catch (error) {
    console.error("Create movie error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Create a new show (Admin only)
 * POST /api/shows
 */
export async function createShow(req, res) {
  const { movieId, showTime, screenNumber } = req.body;

  const conn = await pool.connect();

  try {
    await conn.query("BEGIN");

    // verify movie exists
    const movieCheck = await conn.query("SELECT id FROM movies WHERE id = $1", [
      movieId,
    ]);

    if (movieCheck.rows.length === 0) {
      await conn.query("ROLLBACK");
      return res.status(404).json({ error: "Movie not found" });
    }

    // create show
    const showResult = await conn.query(
      `INSERT INTO shows (movie_id, show_time, screen_number, available_seats)
       VALUES ($1, $2, $3, 120)
       RETURNING *`,
      [movieId, showTime, screenNumber],
    );

    const show = showResult.rows[0];

    // generate 120 seats (8 rows × 15 seats)
    const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    for (const rowLetter of rowLetters) {
      for (let seatNum = 1; seatNum <= 15; seatNum++) {
        let seatType = "regular";

        // VIP seats: Row A (farthest from screen)
        if (rowLetter === "A") {
          seatType = "vip";
        }
        // Wheelchair seats: Row B, first and last seat (seat 1 and seat 15)
        else if (rowLetter === "B" && (seatNum === 1 || seatNum === 15)) {
          seatType = "wheelchair";
        }

        await conn.query(
          `INSERT INTO seats (show_id, row_letter, seat_number, isbooked, seat_type)
           VALUES ($1, $2, $3, FALSE, $4)`,
          [show.id, rowLetter, seatNum, seatType],
        );
      }
    }

    await conn.query("COMMIT");

    res.status(201).json({
      message: "Show created successfully with seats",
      show,
    });
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error("Create show error:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    conn.release();
  }
}
