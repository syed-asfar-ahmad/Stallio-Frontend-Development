/**
 * Stallio brand palette from public/assets/reference/colors/figma-colors.json
 */
export const brandColors = {
  black: "#000000",
  surface: "#FAFAFA",
  white: "#FFFFFF",
  ink: "#09090B",
  brand: "#5E2BEC",
} as const;

export type BrandColor = keyof typeof brandColors;
