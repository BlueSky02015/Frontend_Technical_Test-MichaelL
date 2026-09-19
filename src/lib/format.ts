import { format, formatDistanceToNow } from "date-fns";

export function formatDate(iso: string): string {
  return format(new Date(iso), "dd MMM yyyy");
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "dd MMM yyyy, HH:mm");
}

export function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatQuantity(value: number, unit: string): string {
  return `${formatNumber(value)} ${unit}`;
}
