import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} • ${formatTime(date)}`;
}

export function getDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return getDateKey(d) === getDateKey(today);
}

export function isYesterday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(d) === getDateKey(yesterday);
}

export function getRelativeDateLabel(date: Date | string): string {
  if (isToday(date)) return "Heute";
  if (isYesterday(date)) return "Gestern";
  return formatDate(date);
}
