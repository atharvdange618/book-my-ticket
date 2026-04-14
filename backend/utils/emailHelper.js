import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@bookmyticket.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Format date/time for Indian locale
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date/time
 */
function formatShowTime(dateString) {
  return new Date(dateString).toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

/**
 * Send booking confirmation email
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.userName
 * @param {string} params.movieTitle
 * @param {string} params.showTime
 * @param {string} params.seats
 * @param {number} params.totalPrice
 * @param {number} params.bookingId
 */
export async function sendBookingConfirmation({
  to,
  userName,
  movieTitle,
  showTime,
  seats,
  totalPrice,
  bookingId,
}) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Confirmed: ${movieTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Your movie booking has been confirmed! Get ready for an amazing experience.</p>
              <div class="booking-details">
                <h3 style="margin-top: 0; color: #667eea;">Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span>#${bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Movie:</span>
                  <span>${movieTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Show Time:</span>
                  <span>${formatShowTime(showTime)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Seats:</span>
                  <span>${seats}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span style="font-weight: bold; color: #667eea;">$${parseFloat(totalPrice).toFixed(2)}</span>
                </div>
              </div>
              <p><strong>Important:</strong> Please arrive at least 15 minutes before showtime. Show this email at the counter to collect your tickets.</p>
              <a href="${FRONTEND_URL}/dashboard" class="button">View My Bookings</a>
              <div class="footer">
                <p>Thank you for choosing Book My Ticket!</p>
                <p>Questions? Contact us at support@bookmyticket.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Booking confirmation email sent:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to send booking confirmation email:", error);
    throw error;
  }
}

/**
 * Send booking cancellation email
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.userName
 * @param {string} params.movieTitle
 * @param {string} params.showTime
 * @param {string} params.seats
 * @param {number} params.refundAmount
 * @param {number} params.bookingId
 */
export async function sendCancellationEmail({
  to,
  userName,
  movieTitle,
  showTime,
  seats,
  refundAmount,
  bookingId,
}) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Cancelled: ${movieTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #f5576c; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Booking Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Your booking has been successfully cancelled.</p>
              <div class="booking-details">
                <h3 style="margin-top: 0; color: #f5576c;">Cancellation Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span>#${bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Movie:</span>
                  <span>${movieTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Show Time:</span>
                  <span>${formatShowTime(showTime)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Cancelled Seats:</span>
                  <span>${seats}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Refund Amount:</span>
                  <span style="font-weight: bold; color: #f5576c;">$${parseFloat(refundAmount).toFixed(2)}</span>
                </div>
              </div>
              <p>Your refund will be processed within 5-7 business days.</p>
              <a href="${FRONTEND_URL}/movies" class="button">Browse Movies</a>
              <div class="footer">
                <p>We hope to see you again soon!</p>
                <p>Questions? Contact us at support@bookmyticket.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Cancellation email sent:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to send cancellation email:", error);
    throw error;
  }
}
