import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts error message from API error response
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== "object") return fallback;

  const error = err as {
    response?: {
      data?: {
        error?: string;
        message?: string;
      };
    };
  };

  return (
    error.response?.data?.error || error.response?.data?.message || fallback
  );
}

export function formatDateTimeShort(dt: string) {
  return new Date(dt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatCurrency(amount: string | number) {
  const num = Number(amount);
  if (isNaN(num)) return String(amount);
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
