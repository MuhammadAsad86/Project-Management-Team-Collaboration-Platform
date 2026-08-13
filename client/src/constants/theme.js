// NexaFlow Design Tokens
// Single source of truth for brand colors, typography, radii and shadows.
// Keep component-level styling derived from these values instead of
// hardcoding new hex codes across the app.

export const COLORS = {
  primary: "#4F46E5", // Indigo
  primaryHover: "#4338CA",
  secondary: "#7C3AED", // Violet
  accent: "#06B6D4", // Cyan
  navy: "#0F172A",

  success: "#10B981", // Emerald
  warning: "#F59E0B", // Amber
  danger: "#EF4444", // Red
  info: "#3B82F6", // Blue

  background: "#F8FAFC", // Slate
  surface: "#FFFFFF",

  text: {
    primary: "#0F172A",
    secondary: "#475569",
    muted: "#94A3B8",
    inverse: "#F8FAFC",
  },

  border: "#E2E8F0",
};

// Use sparingly: branding, selected/active states, major highlights.
export const GRADIENT = {
  brand: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
  brandSoft: "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(124,58,237,0.08) 100%)",
};

export const FONTS = {
  heading: "'Sora', 'Inter', sans-serif",
  body: "'Inter', sans-serif",
};

export const BORDER_RADIUS = {
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  pill: "999px",
};

export const SHADOWS = {
  xs: "0 1px 2px rgba(15, 23, 42, 0.04)",
  sm: "0 2px 6px rgba(15, 23, 42, 0.06)",
  md: "0 8px 20px rgba(15, 23, 42, 0.08)",
  lg: "0 20px 40px rgba(15, 23, 42, 0.12)",
  glowPrimary: "0 8px 24px rgba(79, 70, 229, 0.25)",
};

export const TRANSITIONS = {
  fast: "150ms ease",
  base: "200ms ease",
  slow: "300ms ease",
};
