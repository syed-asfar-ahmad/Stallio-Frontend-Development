export type PasswordStrengthKey = 'weak' | 'fair' | 'good' | 'strong';

export type PasswordStrengthResult = {
  score: number;
  strengthKey: PasswordStrengthKey | null;
  color: string;
  hasMinLen: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
};

export function getPasswordStrength(pwd: string): PasswordStrengthResult {
  if (!pwd) {
    return {
      score: 0,
      strengthKey: null,
      color: '',
      hasMinLen: false,
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  const hasMinLen = pwd.length >= 8;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const score = [hasMinLen, hasLower, hasUpper, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  if (score <= 1) {
    return {
      score,
      strengthKey: 'weak',
      color: 'bg-red-500',
      hasMinLen,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
    };
  }
  if (score === 2) {
    return {
      score,
      strengthKey: 'fair',
      color: 'bg-amber-500',
      hasMinLen,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
    };
  }
  if (score === 3) {
    return {
      score,
      strengthKey: 'good',
      color: 'bg-lime-500',
      hasMinLen,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
    };
  }
  return {
    score,
    strengthKey: 'strong',
    color: 'bg-brand-500',
    hasMinLen,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
  };
}
