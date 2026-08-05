/** Shared UI class helpers for consistent polish. */

export const pageHeaderClass = "mb-1";
export const pageTitleClass = "page-title";
export const pageSubtitleClass = "page-subtitle";

export const surfaceCardClass =
  "card border border-base-300/70 bg-base-100 shadow-sm";

export const sectionCardClass =
  "card border border-base-300/70 bg-base-100 shadow-sm";

export const primaryBtnClass = "btn btn-primary pressable";

export function staggerClass(index: number): string {
  const n = Math.min(index + 1, 8);
  return `animate-fade-up stagger-${n}`;
}
