const withIosFileProtection = require('./with-ios-file-protection');

describe('withIosFileProtection', () => {
  it('sets NSFileProtectionKey to CompleteUntilFirstUserAuthentication on the Info.plist mod results', async () => {
    const config = withIosFileProtection({ modResults: {} });

    const result = await config.mods.ios.infoPlist({ modResults: {} });

    expect(result.modResults.NSFileProtectionKey).toBe('NSFileProtectionCompleteUntilFirstUserAuthentication');
  });

  it('preserves existing Info.plist keys', async () => {
    const config = withIosFileProtection({ modResults: {} });

    const result = await config.mods.ios.infoPlist({ modResults: { CFBundleDisplayName: 'expo-base-app' } });

    expect(result.modResults.CFBundleDisplayName).toBe('expo-base-app');
  });
});
