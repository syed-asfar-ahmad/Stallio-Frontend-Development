const LTR_ISOLATE_START = '\u2066';
const LTR_ISOLATE_END = '\u2069';

export function wrapLtrIsolate(value: string): string {
  if (!value) return value;
  return `${LTR_ISOLATE_START}${value}${LTR_ISOLATE_END}`;
}
