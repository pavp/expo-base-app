# Navigation

This document explains how routes are declared, why route files hold no logic, and how layouts compose into the
navigation tree.

## 🎯 Overview

Navigation is **file-based**: the route tree is the folder tree. A file's path is its URL, and a layout file wraps
every route beneath it.

Routes live in a non-default directory, declared through the application entry point rather than assumed by
convention. That entry point also imports the style engine configuration, so styles are registered before the first
screen renders.

## 📁 Route Tree

```
src/app/
├── _layout.tsx                     ## Root: providers, splash gating, screen titles
├── (drawer)/
│   ├── _layout.tsx                 ## Drawer navigator with custom content
│   └── (tabs)/
│       ├── _layout.tsx             ## Tab navigator
│       ├── index.tsx               ## Tab 1
│       └── explore.tsx             ## Tab 2
├── entity/
│   └── [id].tsx                    ## Dynamic route
└── settings/
    └── index.tsx                   ## Nested static route
```

Two naming devices carry meaning:

| Syntax    | Meaning                                                                         |
| --------- | ------------------------------------------------------------------------------- |
| `(name)`  | A **group** — organizes files and applies a layout without adding a URL segment |
| `[param]` | A **dynamic segment** — the value is passed to the screen as a route parameter  |

Because both require characters the file-naming rules forbid, the routes directory is exempt from the kebab-case rule.
That exemption is configured in the lint setup, not tolerated by convention. See
**[File Naming Conventions](./file-naming-conventions.md)**.

## 📄 Route Files

**A route file is three statements.** It imports a view, re-exports the shared error boundary, and renders the view:

```tsx
import { ErrorFallback } from '@/components';
import { EntityListView } from '@/modules/entity';

export { ErrorFallback as ErrorBoundary };

export default function EntityListScreen() {
  return <EntityListView />;
}
```

The error boundary export is part of the pattern, not an extra. The router mounts an exported `ErrorBoundary` around
that route, so a screen that throws renders a recoverable fallback instead of collapsing the application.

### Why Route Files Stay Thin

```tsx
// ❌ Bad — screen logic in the route file
export default function EntityListScreen() {
  const { data } = entityRepository.queries.useEntityList();

  return <FlashList data={data} renderItem={renderEntity} />;
}

// ✅ Good — the route renders a view; logic lives in the module
export default function EntityListScreen() {
  return <EntityListView />;
}
```

Logic in a route file cannot be tested without the router, cannot be reused by a second route, and puts feature code
outside the module that owns the feature.

## 🧩 Layouts

A `_layout.tsx` declares a navigator and wraps every route beneath it.

### Root Layout

The root layout owns everything that must exist before any screen renders: providers, the splash screen, and the
titles of top-level routes.

```tsx
SplashScreen.preventAutoHideAsync();

export { ErrorFallback as ErrorBoundary };

export default function RootLayout() {
  const { appIsReady } = useInitApp();
  const { rt } = useUnistyles();
  const theme = UnistylesRuntime.getTheme(rt.themeName);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <APIProvider>
      <SafeAreaProvider>
        <ThemeProvider value={rt.themeName === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerStyle: { backgroundColor: theme.colors.background } }}>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen name="entity/[id]" options={{ title: t('screens.entity') }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </APIProvider>
  );
}
```

Three details are load-bearing:

**Splash gating.** Auto-hide is prevented at module scope, before React mounts. Rendering `null` until initialization
completes means no screen ever paints with a missing font or an unapplied theme.

**The navigation theme provider.** The navigator needs the framework's own theme object, separate from the styling
engine's, for native header controls to pick up the right appearance.

**Reading the palette from the runtime.** See below.

### The Runtime Palette Rule

Every layout reads the palette the same way:

```typescript
const { rt } = useUnistyles();
const theme = UnistylesRuntime.getTheme(rt.themeName);
```

Navigator options are evaluated outside the normal render path, and the hook's `theme` object can lag behind
`themeName` by a frame — long enough to paint a native header in the previous theme's colours. Subscribing through
`rt` and resolving the palette from the runtime keeps both in step.

Use this in every `_layout.tsx` that colours navigator options. Inside ordinary components, a stylesheet is correct
and this workaround is unnecessary.

### Nested Navigators

A layout inside a group applies to that group only:

```tsx
export default function DrawerLayout() {
  const { rt } = useUnistyles();
  const theme = UnistylesRuntime.getTheme(rt.themeName);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerRight: () => <ThemeButton />,
          headerRightContainerStyle: { paddingRight: theme.margins.xxl },
        }}
      />
    </GestureHandlerRootView>
  );
}
```

Nesting a tab navigator inside a drawer inside a stack gives each screen the chrome of every layout above it, with no
per-screen wiring.

## 🔀 Typed Navigation

Typed routes are enabled in the application configuration, which generates route types from the file tree. Navigation
targets are then checked at compile time:

```typescript
// ✅ Good — path and parameters are both checked
router.navigate({ pathname: '/entity/[id]', params: { id: entity.id } });

// ❌ Bad — a hand-built string the compiler cannot verify
router.navigate(`/entity/${entity.id}`);
```

A renamed or deleted route becomes a build error rather than a runtime dead end.

## 🌍 Screen Titles

Titles are user-facing strings and follow the same rule as every other one — a translation key, never a literal:

```tsx
<Stack.Screen name="settings/index" options={{ title: t('screens.settings') }} />
```

Add the key to every locale file. See **[Internationalization](./intl.md)**.

## 🎨 Best Practices

### 1. One View per Route

A route renders exactly one view. Composition happens inside the module.

### 2. Always Export the Error Boundary

Every route file re-exports the shared fallback. A route without one takes the whole application down when it throws.

### 3. Group Instead of Repeating Options

Screens sharing chrome belong in a group with one layout, not in separate files repeating the same options.

### 4. Never Build a Path by Hand

Use the typed object form so the compiler can check both the path and its parameters.

### 5. Keep Layout Logic in Hooks

A layout needing initialization calls a hook that returns a flag. Initialization logic itself belongs in a module.

## 📚 Related Documentation

- **[Project Structure](./project-structure.md)** - Where routes sit relative to modules
- **[Theming](./theming.md)** - The runtime palette rule in full
- **[Module Architecture](./module-architecture.md)** - What a view is and where it lives
- **[Internationalization](./intl.md)** - Translating screen titles
