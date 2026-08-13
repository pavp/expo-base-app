const { withGradleProperties } = require('expo/config-plugins');

/**
 * Tunes `android/gradle.properties` for local development builds.
 *
 * The native `android/` directory is gitignored and regenerated on every
 * prebuild, so hand-edits to gradle.properties do not survive. This plugin
 * reapplies them as part of the prebuild itself.
 *
 * Two things are tuned:
 *
 * 1. Memory. Gradle, the Kotlin daemon and the emulator all compete for the
 *    same RAM. Without explicit ceilings the daemons grow until the host
 *    swaps, and on an 8 GB machine the build dies mid-compile.
 *
 * 2. Target ABIs. React Native compiles native code for four architectures by
 *    default. A local emulator or a modern phone only ever loads one of them,
 *    so the other three are pure build time — the NDK step is the slowest part
 *    of a clean build.
 *
 * Both are wrong for CI and for release builds, which must stay portable and
 * can use the full machine. The plugin is therefore a no-op unless
 * LOCAL_ANDROID_BUILD is set, and EAS builds are excluded explicitly.
 */

const LOCAL_ONLY_PROPERTIES = {
  'org.gradle.jvmargs': '-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8',
  'org.gradle.parallel': 'false',
  'org.gradle.workers.max': '2',
  'org.gradle.caching': 'true',
  'kotlin.daemon.jvmargs': '-Xmx1024m',
  reactNativeArchitectures: 'arm64-v8a',
};

function isLocalBuild() {
  // EAS sets EAS_BUILD on its workers; never tune those.
  if (process.env.EAS_BUILD === 'true' || process.env.CI === 'true') {
    return false;
  }

  return process.env.LOCAL_ANDROID_BUILD === '1';
}

function upsert(properties, key, value) {
  const existing = properties.find(
    (item) => item.type === 'property' && item.key === key,
  );

  if (existing) {
    existing.value = value;
    return properties;
  }

  return [...properties, { type: 'property', key, value }];
}

module.exports = function withLocalGradleTuning(config) {
  return withGradleProperties(config, (modConfig) => {
    if (!isLocalBuild()) {
      return modConfig;
    }

    modConfig.modResults = Object.entries(LOCAL_ONLY_PROPERTIES).reduce(
      (properties, [key, value]) => upsert(properties, key, value),
      modConfig.modResults,
    );

    return modConfig;
  });
};
