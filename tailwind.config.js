/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F9FAFB",  // A bright, clean background
        foreground: "#1F2937",  // A deeper gray for text

        // Strong brand blue
        primary: {
          DEFAULT: "#3B82F6",
          foreground: "#ffffff",
        },

        // Use a simpler accent (like emerald) or a brand variant
        accent: {
          DEFAULT: "#10B981",
          foreground: "#ffffff",
        },

        // For destructive actions, keep it robust
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#ffffff",
        },

        // More refined neutrals
        muted: {
          DEFAULT: "#E5E7EB", 
          foreground: "#6B7280",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#374151",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1F2937",
        },
      },
      borderRadius: {
        // Let's unify to a single bigger radius
        DEFAULT: "10px",
        lg: "12px",
        full: "9999px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

