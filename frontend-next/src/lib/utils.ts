import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * English: Utility to merge Tailwind classes.
 * This is what @/components/ui/avatar.tsx is looking for.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
