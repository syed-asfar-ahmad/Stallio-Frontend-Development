export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidUsername(value: string) {
  return /^[a-zA-Z0-9_-]+$/.test(value.trim()) && value.trim().length >= 3;
}
