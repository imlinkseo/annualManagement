import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const removeHtmlTags = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, "") // Remove non-breaking spaces
    .trim(); // Trim whitespace
};

export function isDeepEqual<T>(a: T | null | undefined, b: T | null | undefined) {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}