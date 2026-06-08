/** Stringing service is FREE per business logic §2.7. Kept as a constant for future change. */
export const STRINGING_SERVICE_FEE = 0;

/** Adding stringing adds this many days to the ship lead time (§2.5). */
export const STRINGING_LEAD_TIME_ADDED_DAYS = 1;

/** Grip choices offered during stringing config (§2.2). MVP: grips are enum; products come later. */
export const GRIP_OPTIONS = [
  { value: 'ORIGINAL',        label: 'Original Grip (no change)' },
  { value: 'BLACK_OVERGRIP',  label: 'Black Overgrip' },
  { value: 'WHITE_OVERGRIP',  label: 'White Overgrip' },
  { value: 'YELLOW_OVERGRIP', label: 'Yellow Overgrip' },
  { value: 'RED_OVERGRIP',    label: 'Red Overgrip' },
] as const;

export type GripChoice = typeof GRIP_OPTIONS[number]['value'];
