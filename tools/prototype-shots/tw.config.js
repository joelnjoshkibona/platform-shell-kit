module.exports = Object.assign({
  theme: { extend: {
    colors: {
      border: 'hsl(var(--border) / <alpha-value>)', input: 'hsl(var(--input) / <alpha-value>)', ring: 'hsl(var(--ring) / <alpha-value>)',
      background: 'hsl(var(--background) / <alpha-value>)', foreground: 'hsl(var(--foreground) / <alpha-value>)',
      canvas: 'hsl(var(--canvas) / <alpha-value>)',
      primary: { DEFAULT: 'hsl(var(--primary) / <alpha-value>)', foreground: 'hsl(var(--primary-foreground) / <alpha-value>)' },
      secondary: { DEFAULT: 'hsl(var(--secondary) / <alpha-value>)', foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)' },
      destructive: { DEFAULT: 'hsl(var(--destructive) / <alpha-value>)', foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)' },
      muted: { DEFAULT: 'hsl(var(--muted) / <alpha-value>)', foreground: 'hsl(var(--muted-foreground) / <alpha-value>)' },
      accent: { DEFAULT: 'hsl(var(--accent) / <alpha-value>)', foreground: 'hsl(var(--accent-foreground) / <alpha-value>)' },
      popover: { DEFAULT: 'hsl(var(--popover) / <alpha-value>)', foreground: 'hsl(var(--popover-foreground) / <alpha-value>)' },
      card: { DEFAULT: 'hsl(var(--card) / <alpha-value>)', foreground: 'hsl(var(--card-foreground) / <alpha-value>)' },
      warning: 'hsl(var(--warning) / <alpha-value>)', success: 'hsl(var(--success) / <alpha-value>)',
      c1: 'color-mix(in oklab, var(--c1) calc(<alpha-value> * 100%), transparent)', c2: 'color-mix(in oklab, var(--c2) calc(<alpha-value> * 100%), transparent)', c3: 'color-mix(in oklab, var(--c3) calc(<alpha-value> * 100%), transparent)', c4: 'color-mix(in oklab, var(--c4) calc(<alpha-value> * 100%), transparent)', c5: 'color-mix(in oklab, var(--c5) calc(<alpha-value> * 100%), transparent)',
      fa: { DEFAULT: 'hsl(var(--form-accent) / <alpha-value>)', fg: 'hsl(var(--form-accent-fg) / <alpha-value>)' },
    },
    borderRadius: { xl: 'calc(var(--radius) + 4px)', lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
    fontFamily: { sans: ['Geist', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'], mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'] },
  } }
},{content:['../../prototype/index.html', '../../docs/design/prototype/index.html']});