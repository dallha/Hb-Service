import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
        "surface-container-high": "#dce9ff",
        "on-surface": "#0b1c30",
        "accent-success": "#00855b",
        "surface-bright": "#f8f9ff",
        "on-background": "#0b1c30",
        "secondary-container": "#dbe4ea",
        "on-secondary-fixed": "#141d21",
        "outline-soft": "#c2c6d6",
        "on-tertiary-container": "#92e7bc",
        "on-surface-variant": "#424754",
        "error-container": "#ffdad6",
        "primary-container": "#004D40",
        "inverse-primary": "#adc6ff",
        "on-tertiary": "#ffffff",
        "on-primary-fixed": "#001a42",
        "secondary-fixed": "#dbe4ea",
        "error": "#ba1a1a",
        "surface-main": "#f8f9ff",
        "tertiary-fixed": "#9ff4c8",
        "on-secondary-fixed-variant": "#3f484d",
        "on-secondary-container": "#5d666b",
        "tertiary": "#005035",
        "surface": "#f8f9ff",
        "on-primary-fixed-variant": "#004395",
        "surface-container-low": "#eff4ff",
        "inverse-on-surface": "#eaf1ff",
        "outline": "#727784",
        "surface-tint": "#085ac0",
        "tertiary-fixed-dim": "#83d7ad",
        "surface-sidebar": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "on-primary": "#ffffff",
        "secondary-fixed-dim": "#bfc8cd",
        "primary-fixed-dim": "#adc6ff",
        "accent-error": "#ba1a1a",
        "on-error-container": "#93000a",
        "surface-dim": "#cbdbf5",
        "surface-container": "#e5eeff",
        "surface-card": "#ffffff",
        "surface-variant": "#d3e4fe",
        "outline-variant": "#c2c6d5",
        "on-primary-container": "#ffffff",
        "on-secondary": "#ffffff",
        "primary-fixed": "#d8e2ff",
        "tertiary-container": "#026a48",
        "on-error": "#ffffff",
        "on-tertiary-fixed-variant": "#005236",
        "on-tertiary-fixed": "#002113",
        "inverse-surface": "#213145",
        "surface-container-highest": "#d3e4fe"
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
        "xl": "0.75rem",
        "full": "9999px"
  		},
      spacing: {
        "gutter": "24px",
        "sidebar-width": "280px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
        "container-max": "1440px",
        "unit": "4px"
      },
      fontFamily: {
        "title-md": ["var(--font-hanken-grotesk)"],
        "headline-lg-mobile": ["var(--font-hanken-grotesk)"],
        "body-lg": ["var(--font-hanken-grotesk)"],
        "headline-lg": ["var(--font-hanken-grotesk)"],
        "display-lg": ["var(--font-hanken-grotesk)"],
        "body-sm": ["var(--font-hanken-grotesk)"],
        "label-caps": ["var(--font-hanken-grotesk)"],
        sans: ["var(--font-hanken-grotesk)", "sans-serif"]
      }
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
