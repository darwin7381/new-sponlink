import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine multiple class names into a single string, with Tailwind CSS optimization.
 * This function leverages clsx for class naming and tailwind-merge to avoid conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
