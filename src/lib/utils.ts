import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export const timeAgo = (date: string | Date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  let i = seconds / 31536000;
  if (i > 1) return Math.floor(i) + "y";
  i = seconds / 2592000;
  if (i > 1) return Math.floor(i) + "mo";
  i = seconds / 86400;
  if (i > 1) return Math.floor(i) + "d";
  i = seconds / 3600;
  if (i > 1) return Math.floor(i) + "h";
  i = seconds / 60;
  if (i > 1) return Math.floor(i) + "m";
  return Math.max(1, Math.floor(seconds)) + "s";
};
