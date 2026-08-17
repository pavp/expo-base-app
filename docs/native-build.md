# Native Builds

This document explains how native projects are generated, how to change native configuration without editing generated
files, and how to build on a memory-constrained machine.

## 🎯 Overview

The native iOS and Android projects are **generated output**, not source. They are produced from the application
configuration and a set of config plugins, and they can be deleted and regenerated at any time.

That is why native directories are excluded from linting and version control: an edit made directly to a generated
file survives exactly until the next regeneration, then vanishes without a trace.

**To change something native, change the configuration or write a plugin.** Never edit the generated project.

## 📁 Structure

```
app.config.ts                          ## Application configuration (dynamic, TypeScript)
plugins/
├── with-local-gradle-tuning.js        ## Adjusts Gradle memory settings for local builds
└── with-ios-file-protection.js        ## Sets the iOS file protection class
android/                               ## Generated — do not edit, do not commit
ios/                                   ## Generated — do not edit, do not commit
```

## ⚙️ Application Configuration

The configuration is TypeScript rather than static JSON, so values can be derived and the file can be type-checked:

```typescript
export default {
  name: 'app-name',
  experiments: { typedRoutes: true },
  android: { allowBackup: false },
  plugins: ['expo-secure-store', './plugins/with-ios-file-protection', './plugins/with-local-gradle-tuning'],
};
```

Two settings here are security hardening rather than features:

**Disabled backups** keep application data out of device-level cloud backups. The cost is that preferences do not
survive a device restore — acceptable when they regenerate on next launch, and worth reconsidering before storing
anything a user would miss.

**A file protection class** encrypts the application container at rest on iOS. The chosen class permits access after
first unlock rather than requiring the device to be unlocked at every access — the stricter class makes the container
unreadable while locked, which breaks any code path that runs before first unlock.

## 🔌 Config Plugins

A plugin is a function that receives the configuration and returns it modified. It is how a native file gets patched
reproducibly:

```javascript
const { withInfoPlist } = require('expo/config-plugins');

const withIosFileProtection = (config) =>
  withInfoPlist(config, (plistConfig) => {
    plistConfig.modResults.NSFileProtectionKey = 'NSFileProtectionCompleteUntilFirstUserAuthentication';

    return plistConfig;
  });

module.exports = withIosFileProtection;
```

Plugins run during generation, in the order they are registered. Because generation is deterministic, the same
configuration always produces the same native project.

### When to Write a Plugin

| Need                                                        | Approach                                               |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| A setting the configuration schema already exposes          | Set it in the configuration                            |
| A manifest entry, plist key, or Gradle property it does not | Write a plugin                                         |
| A library requiring native setup                            | Use the plugin the library ships                       |
| A one-off experiment                                        | Regenerate afterwards — never leave a hand edit behind |

## 🚀 Build Commands

| Command                 | What it does                                            |
| ----------------------- | ------------------------------------------------------- |
| `pnpm start`            | Starts the development server against an existing build |
| `pnpm prebuild`         | Generates both native projects                          |
| `pnpm android:prebuild` | Regenerates the Android project from scratch            |
| `pnpm android:build`    | Regenerates, then compiles a debug build                |
| `pnpm android:install`  | Installs the compiled build on a connected device       |
| `pnpm ios`              | Boots a simulator and compiles                          |
| `pnpm android`          | Boots an emulator and compiles                          |
| `pnpm doctor`           | Checks installed dependency versions against the SDK    |

## ⚠️ Low-Memory Hosts

`pnpm ios` and `pnpm android` **boot a device before compiling**. The simulator or emulator and the compiler then
compete for memory, and on a machine with 8 GB the compiler loses — free memory has been measured dropping to double
digits of megabytes mid-compile, at which point the build crawls or dies.

### Build, Then Boot

On a constrained machine, separate the two:

```bash
# 1. Compile with nothing else running
pnpm android:build

# 2. Boot the emulator

# 3. Install the compiled build
pnpm android:install
```

**Never hold the compiler, a device, and the development server at once.** Any two are usually fine; all three are
not.

A config plugin tunes local Gradle memory settings for this constraint. It applies to local builds and does not affect
cloud builds, which are not memory-constrained in the same way.

## ✅ Verifying Native Configuration

Native settings are invisible to linting, type checking, and tests — all three pass whether or not the setting reached
the manifest. Verify against the generated output instead:

```bash
# Android — inspect the generated manifest
pnpm android:prebuild
rg 'allowBackup' android/app/src/main/AndroidManifest.xml

# iOS — inspect the generated property list
pnpm exec expo prebuild --platform ios --clean
rg -A1 'NSFileProtectionKey' ios/*/Info.plist
```

Run these with no simulator or emulator booted, for the memory reasons above.

**A native change is not verified by a green build.** It is verified by reading the generated file, or by observing the
behaviour on a device.

## 🔄 Regenerating

Regeneration is destructive and complete: the native directory is deleted and rebuilt from the configuration. That is
the intended workflow, and it is safe precisely because nothing hand-written lives there.

Regenerate after changing the configuration, adding or editing a plugin, or upgrading a dependency with a native
component.

## 🎨 Best Practices

### 1. Never Commit Generated Projects

They are reproducible from the configuration. Committing them creates merge conflicts in files nobody wrote.

### 2. Never Hand-Edit a Generated File

The change is silently lost at the next regeneration — the worst kind of bug, because it works until it doesn't.

### 3. Keep Plugins Small and Named

One plugin, one concern, named for what it does. A plugin doing three unrelated things cannot be removed when one of
them becomes obsolete.

### 4. Verify Against Generated Output

Read the manifest or the property list. The automated checks cannot see native configuration.

### 5. Document Security Trade-offs

When a hardening setting has a cost — a lost backup, a stricter access window — record it beside the setting, so the
next reader can weigh it rather than rediscover it.

## 📚 Related Documentation

- **[Setup](./setup.md)** - Getting a development environment running
- **[Project Structure](./project-structure.md)** - Where configuration and plugins sit
- **[Rules and Conventions](./rules-conventions.md)** - What the automated checks do and do not cover
