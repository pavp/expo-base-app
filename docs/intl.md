# Internationalization

This document explains how translations are declared, how a language is chosen at startup, and how to add a string or
a language.

## 🎯 Overview

Every user-facing string comes from a translation catalogue. A literal in a component is a defect, even in a
single-language build — it is invisible to translation, invisible to review, and duplicated the moment the same words
appear on a second screen.

Catalogues are **TypeScript modules, not JSON files**. That choice buys type checking across locales: a key present in
one catalogue and missing from another is a compile error rather than a blank label discovered in production.

## 📁 Structure

```
src/localization/
├── i18n.ts              ## Engine setup, supported languages, device detection
└── locales/
    ├── index.ts         ## Re-exports each catalogue under its locale code
    ├── en-us.ts         ## English catalogue
    └── es-es.ts         ## Spanish catalogue
```

## 🚀 Usage

Read strings through the translation hook:

```tsx
export const EntityListView = () => {
  const { t } = useTranslation();

  return <EmptyState title={t('entity.emptyTitle')} description={t('entity.emptyDescription')} />;
};
```

### Interpolation

Values are passed as named parameters, never concatenated — word order differs between languages, and a sentence
assembled from fragments cannot be translated correctly:

```tsx
// ✅ Good
t('entity.noResults', { term: searchTerm });

// ❌ Bad — untranslatable word order
`${t('entity.noResultsPrefix')} "${searchTerm}"`;
```

```typescript
export default {
  translation: {
    entity: {
      noResults: 'No results for "{{term}}"',
    },
  },
};
```

### Primitives Take Strings as Props

A presentational primitive never translates. It receives finished strings, which keeps it reusable in any context:

```tsx
// ✅ Good — the caller translates
<EmptyState title={t('entity.emptyTitle')} />;

// ❌ Bad — a primitive reaching for the catalogue
export const EmptyState = () => {
  const { t } = useTranslation();

  return <Text>{t('entity.emptyTitle')}</Text>;
};
```

## ⚙️ Language Selection

Language is resolved in two stages, because a stored preference is not available synchronously.

**At setup**, the engine initializes with the device locale when it is supported, and the default locale otherwise:

```typescript
export const supportedLanguages = ['en', 'es'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const deviceLocale = getLocales()[0]?.languageCode;

i18n.use(initReactI18next).init({
  resources: { en: en_US, es: es_ES },
  lng: isSupported(deviceLocale) ? deviceLocale : config.translation.defaultLocale,
  interpolation: { escapeValue: false },
});
```

**At boot**, an initialization hook reads the stored preference and applies it, validating the value before use —
storage can hold a language that a later build no longer ships:

```typescript
export const useInitLanguage = () => {
  const [languageIsReady, setLanguageIsReady] = useState(false);

  useEffect(() => {
    const applyStoredLanguage = async () => {
      try {
        const stored = await getItem(SETTINGS_STORAGE_KEY.LANGUAGE);

        if (stored && supportedLanguages.includes(stored as SupportedLanguage)) {
          await i18n.changeLanguage(stored);
        }
      } finally {
        setLanguageIsReady(true);
      }
    };

    applyStoredLanguage();
  }, []);

  return { languageIsReady };
};
```

The `finally` block is what guarantees the app starts even if the read fails. Booting in the wrong language beats not
booting.

The application waits for this flag before rendering, so no screen paints in one language and then switches.

## ✍️ Adding a Translation

### 1. Add the Key to Every Catalogue

The same key, in the same position, in all of them:

```typescript
// locales/en-us.ts
export default {
  translation: {
    entity: {
      emptyTitle: 'No entities yet',
    },
  },
};

// locales/es-es.ts
export default {
  translation: {
    entity: {
      emptyTitle: 'Aún no hay entidades',
    },
  },
};
```

### 2. Use It

```tsx
const { t } = useTranslation();

return <EmptyState title={t('entity.emptyTitle')} />;
```

Group keys by the feature that owns them. A flat catalogue becomes unnavigable long before it becomes large.

## 🌐 Adding a Language

1. Create the catalogue file, copying an existing one and translating its values
2. Re-export it from `locales/index.ts`
3. Add the code to `supportedLanguages`
4. Register the catalogue in the engine's resources

The type derived from `supportedLanguages` propagates automatically, so the compiler flags every switch or map that
now needs a case.

## 🔄 Changing Language at Runtime

A settings hook owns the change and the write, so the two never drift:

```typescript
export const useSettingsBusiness = () => {
  const setLanguage = useCallback(async (language: SupportedLanguage) => {
    await i18n.changeLanguage(language);
    await setItem(SETTINGS_STORAGE_KEY.LANGUAGE, language);
  }, []);

  return { setLanguage };
};
```

A single owner for each storage key is the rule. Several components writing the same key independently is how a
preference ends up inconsistent with what the app is showing.

**Read the instance from the hook, not the imported singleton**, when a component needs to display the current
language. The hook's instance triggers a re-render on change; the module-level singleton does not.

## 🎨 Best Practices

### 1. No Literals in Components

Every user-facing string is a key. This includes screen titles, accessibility labels, and error copy.

### 2. Update Every Catalogue in the Same Change

A key added to one locale and not the others is a missing translation shipped.

### 3. Interpolate, Never Concatenate

Pass values as parameters so translators control word order.

### 4. Validate Stored Values

A persisted language is untrusted input — check it against the supported list before applying it.

### 5. Keep Primitives Translation-Free

Strings are props at the primitive layer. Translation happens in views and app-level components.

## 📚 Related Documentation

- **[Project Structure](./project-structure.md)** - Where localization sits
- **[Navigation](./navigation.md)** - Translating screen titles
- **[Theming](./theming.md)** - The parallel boot-time preference flow
