# Theming

This document explains how the design system is defined, how a component consumes it, and why colour values never
appear in component code.

## 🎯 Overview

Themes are the single source of truth for every visual constant in the application — colours, spacing, radii, border
widths, and type sizes. A component reads tokens; it never declares a value of its own.

### Key Benefits

- **One palette** — a colour exists in exactly one place, so a redesign is an edit rather than a search
- **Automatic dark mode** — a component styled with tokens supports both themes without a conditional
- **Type-safe access** — token names are checked at compile time, so a typo is a build error
- **Runtime switching** — changing theme repaints without a reload

## 📁 Structure

```
src/styles/
├── themes.ts        ## Token scales and the light and dark palettes
├── breakpoints.ts   ## Named width thresholds
└── unistyles.ts     ## Engine configuration and type registration
```

The style engine is configured once, at startup, from the application entry point — before any component renders. A
component that rendered first would style itself against an unconfigured engine.

## 🎨 Token Categories

Tokens split into two groups by whether they vary between themes.

### Shared Scales

Spacing, radii, border widths, and type sizes are identical in every theme. They are defined once and spread into
both:

```typescript
const commonTheme = {
  margins: { sm: 2, md: 4, lg: 8, xl: 12, xxl: 16, xxxl: 32 },
  padding: { sm: 2, md: 4, lg: 8, xl: 12, xxl: 16, xxxl: 32 },
  radius: { sm: 2, md: 4, lg: 8 },
  borderWidth: { sm: 1, md: 2, lg: 4 },
  fontSize: { xs: 8, sm: 12, md: 16, lg: 24 },
};
```

Named steps rather than raw numbers are what keep spacing consistent across screens built months apart.

### Colours

Colours are the only tokens that differ between themes. Both palettes declare **the same key set** — a key present in
one and missing from the other is a compile error, not a runtime surprise in dark mode:

```typescript
export const lightTheme = {
  ...commonTheme,
  colors: {
    primary: '#6F53DE',
    onPrimary: '#FFFFFF',
    typography: '#131218',
    typographyMuted: '#5A5866',
    background: '#FFFFFF',
    border: '#FFFFFF',
    highlight: '#EFEDFB',
    surface: '#FFFFFF',
    surfaceSelected: '#EFEDFB',
    white: '#FFFFFF',
    black: '#000000',
  },
};
```

## 🎨 Choosing a Colour Value

Dark mode is not the light palette inverted. Each value is chosen against its own background, and the reasoning is
recorded in a comment beside it:

```typescript
export const darkTheme = {
  ...commonTheme,
  colors: {
    // Lifted from the light primary: the light value drops below 4.5:1 on a dark surface.
    primary: '#9583EC',
    // Near-black rather than white: white text on the lifted primary falls to roughly 3.1:1.
    onPrimary: '#131218',
    // Deliberately not pure white — full-white body text haloes against dark backgrounds on OLED panels.
    typography: '#D4D2DC',
    // ...
  },
};
```

**Record the why, not the what.** `primary: '#9583EC'` is self-evident; that it was lifted to clear a contrast
threshold is not, and is exactly what stops the next reader from "fixing" it back.

Body text and interactive elements target a 4.5:1 contrast ratio against their own background.

## 🚀 Usage

### Sibling Stylesheet

Styles live in a `styles.ts` beside the component, built from a callback that receives the theme:

```typescript
import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.padding.xxl,
    flex: 1,
  },
  title: {
    color: theme.colors.typography,
    fontSize: theme.fontSize.lg,
  },
}));
```

The callback re-runs on theme change, so nothing in the component needs to subscribe.

### Variant Functions

When a style depends on component state, export a function rather than branching in the component:

```typescript
export const styles = StyleSheet.create((theme) => ({
  chip: (isSelected: boolean) => ({
    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSelected,
    color: isSelected ? theme.colors.onPrimary : theme.colors.typography,
    borderRadius: theme.radius.lg,
  }),
}));
```

Consumed as `style={styles.chip(isSelected)}`. This keeps the conditional in the stylesheet, where every other visual
decision already lives.

### Reading Tokens in a Component

Some props take a colour directly rather than through a style object — an icon's colour, a placeholder's tint. For
those, read the theme at runtime:

```typescript
export const SearchField = ({ placeholder }: SearchFieldProps) => {
  const { theme } = useUnistyles();

  return <TextInput placeholderTextColor={theme.colors.typographyMuted} style={styles.input} />;
};
```

Use this only where a stylesheet cannot reach. A component reaching for `useUnistyles` to compute a normal style has
usually skipped a variant function.

### Reading the Palette in Navigation Options

Navigator options are configured outside the render tree and can lag a theme change by one frame. Subscribe to the
change but read the palette from the runtime:

```typescript
const { rt } = useUnistyles();
const theme = UnistylesRuntime.getTheme(rt.themeName);
```

The hook's own `theme` object can trail `themeName`, which paints native headers with the previous theme's colours.
Reading through the runtime resolves the palette that matches the name currently in effect.

## 📱 Breakpoints

Named width thresholds, available in any style callback:

```typescript
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  superLarge: 2000,
  tvLike: 4000,
};
```

```typescript
export const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: { xs: 'column', md: 'row' },
    padding: { xs: theme.padding.lg, md: theme.padding.xxxl },
  },
}));
```

## 🛠️ Type Registration

Token types reach the style callback through module augmentation, declared once:

```typescript
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- empty bodies are the declaration-merging mechanism
declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}
```

The empty bodies are not an oversight — declaration merging is what makes them work, and the disable comment records
that so nobody deletes them as dead code.

## 🎨 Best Practices

### 1. Never Hardcode a Value

```typescript
// ❌ Bad — invisible to a theme change, invisible to a redesign
container: { backgroundColor: '#f4f4f7', padding: 16 }

// ✅ Good
container: { backgroundColor: theme.colors.background, padding: theme.padding.xxl }
```

### 2. Never Introduce a Second Palette

A `colors.ts` beside a component is a second source of truth that dark mode will not reach. Add the token to both
themes instead.

### 3. Add Colours in Pairs

A new colour goes into **both** palettes in the same edit. A scale value goes into the shared tokens, where both
inherit it.

### 4. Style Through the Stylesheet

Reach for `useUnistyles` only when a prop takes a raw colour. Everything else belongs in `styles.ts`.

### 5. Keep the Rationale

When a value is chosen for contrast, legibility, or a platform quirk, say so in a comment. Otherwise it reads as
arbitrary and gets "corrected".

## 🤔 FAQ

**Can a component define a one-off colour?** No. If it is worth rendering, it is worth naming in both palettes.

**How is the theme persisted?** A settings hook writes the preference to device storage and a boot-time hook applies
it before the first render. See **[Internationalization](./intl.md)** for the parallel language flow.

**What about system dark mode?** The engine supports adaptive themes. Setting an explicit theme disables adaptation,
so an explicit user choice is not overridden by a system change.

## 📚 Related Documentation

- **[Project Structure](./project-structure.md)** - Where styles sit in the tree
- **[Rules and Conventions](./rules-conventions.md)** - The no-hardcoded-values rule
- **[Navigation](./navigation.md)** - Where the runtime palette quirk applies
