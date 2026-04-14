# Book My Ticket

A movie booking platform built with modern web technologies. This full-stack application allows users to browse movies, select seats, and book tickets with real-time availability updates.

## Features

### User Features

- Browse available movies with detailed information
- View movie schedules and showtimes
- Interactive seat selection with real-time availability
- Multiple seat types (Regular, Premium, VIP, Wheelchair accessible)
- Secure booking system with email confirmations
- Booking history and management
- Dark mode support

### Admin Features

- Comprehensive dashboard with platform statistics
- Movie management (Create, Update, Delete)
- Show scheduling and management
- User management with role assignment
- Booking analytics and revenue tracking
- Real-time platform metrics

## Tech Stack

### Backend

- **Runtime:** Node.js with Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Email Service:** Resend
- **Validation:** express-validator
- **Security:** Rate limiting, CORS, input sanitization

### Frontend

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **State Management:** Zustand
- **Server State:** TanStack Query (React Query)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form with Zod validation
- **Notifications:** Goey Toast
- **Date Handling:** date-fns

## Project Structure

```
book-my-ticket/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Authentication, validation, rate limiting
│   ├── migrations/       # Database schema migrations
│   ├── routes/           # API route definitions
│   ├── scripts/          # Utility scripts
│   ├── utils/            # Helper functions
│   └── index.js          # Application entry point
│
└── frontend/
    ├── public/           # Static assets
    └── src/
        ├── api/          # API integration layer
        ├── components/   # React components
        │   ├── layout/   # Layout components
        │   ├── shared/   # Reusable components
        │   └── ui/       # UI primitives
        ├── lib/          # Utility functions
        ├── pages/        # Page components
        ├── stores/       # Zustand stores
        └── types/        # TypeScript type definitions
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Bun (recommended) or npm

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/atharvdange618/book-my-ticket.git
cd book-my-ticket
```

### 2. Backend Setup

```bash
cd backend
bun install
```

Create a `.env` file in the backend directory:

```env
PORT=8080

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=bookmyticket

JWT_SECRET=your_super_secret_jwt_key_here

RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

### 2. Frontend Setup

```bash
cd ../frontend
bun install
```

The frontend proxies API requests to `http://localhost:8080` by default (configured in `vite.config.ts`).

## Running the Application

### Start the Backend

```bash
cd backend
bun start
# or for development with auto-reload
bun run dev
```

The backend server will start on `http://localhost:8080`

### Start the Frontend

```bash
cd frontend
bun run dev
```

The frontend development server will start on `http://localhost:5173`

## Environment Variables

### Backend

| Variable         | Description                | Required                |
| ---------------- | -------------------------- | ----------------------- |
| `PORT`           | Server port number         | No (default: 8080)      |
| `DB_HOST`        | PostgreSQL host            | No (default: localhost) |
| `DB_PORT`        | PostgreSQL port            | No (default: 5432)      |
| `DB_USER`        | PostgreSQL username        | Yes                     |
| `DB_PASSWORD`    | PostgreSQL password        | Yes                     |
| `DB_NAME`        | PostgreSQL database name   | Yes                     |
| `JWT_SECRET`     | Secret key for JWT signing | Yes                     |
| `RESEND_API_KEY` | Resend API key for emails  | Yes                     |
| `FROM_EMAIL`     | Email sender address       | Yes                     |

### Frontend

The frontend uses Vite's proxy configuration to redirect API calls to the backend. No environment variables are required for local development.

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Movies

- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie details
- `POST /api/movies` - Create movie (admin only)

### Shows

- `GET /api/shows/movie/:movieId` - Get shows for a movie
- `GET /api/shows/:id` - Get show details with seat map
- `POST /api/shows` - Create show (admin only)

### Bookings

- `POST /api/bookings` - Create a booking
- `GET /api/bookings` - Get user's bookings
- `DELETE /api/bookings/:id/cancel` - Cancel booking

### Admin

- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bookings` - Get all bookings
- `DELETE /api/admin/users/:userId` - Delete user

## Database Schema

### Users

- User authentication and profile information
- Role-based access control (user/admin)

### Movies

- Movie information (title, description, duration, genre, rating)
- Base pricing and poster URLs

### Shows

- Movie showtimes and screen assignments
- Available seats tracking

### Seats

- Seat mapping for each show
- Seat types and pricing multipliers
- Booking status

### Bookings

- User booking records
- Payment and confirmation details
- Booking status tracking

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on all API endpoints
- Input validation and sanitization
- CORS protection
- SQL injection prevention with parameterized queries
- XSS protection

## Building for Production

### Backend

```bash
cd backend
bun start
```

### Frontend

```bash
cd frontend
bun run build
bun run preview
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

[Atharv Dange](https://x.com/atharvdangedev)

Built with care for delivering a seamless movie booking experience.

## Acknowledgments

- Built with Express.js and React
- UI components from shadcn/ui
- Icons from Phosphor Icons
- Email service powered by Resend
