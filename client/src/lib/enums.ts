export const PLAY_STYLE_LABEL: Record<string, string> = {
  POWER_HEAD_HEAVY: 'HEAD HEAVY',
  SPEED_HEAD_LIGHT: 'HEAD LIGHT',
  CONTROL_EVEN_BALANCE: 'EVEN',
};

export const FLEX_LABEL: Record<string, string> = {
  STIFF: 'STIFF',
  MEDIUM: 'MEDIUM',
  FLEXIBLE: 'FLEXIBLE',
};

export function playStyleLabel(v: string | null | undefined): string {
  return v ? (PLAY_STYLE_LABEL[v] ?? v) : '';
}

export function flexLabel(v: string | null | undefined): string {
  return v ? (FLEX_LABEL[v] ?? v) : '';
}
