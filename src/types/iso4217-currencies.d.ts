declare module '@mreduar/iso-4217-currencies' {
  const iso4217: {
    codeForCountry(countryCode: string): string;
    codes: string[];
    map: Record<string, { name?: string; symbol?: string; symbolNative?: string }>;
  };
  export default iso4217;
}
