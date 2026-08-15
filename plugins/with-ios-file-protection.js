const { withInfoPlist } = require('expo/config-plugins');

// Not `Complete`, which leaves the container unreadable while the device is locked and so breaks
// background fetch and notification taps on a locked screen.
module.exports = function withIosFileProtection(config) {
  return withInfoPlist(config, (modConfig) => {
    modConfig.modResults.NSFileProtectionKey = 'NSFileProtectionCompleteUntilFirstUserAuthentication';

    return modConfig;
  });
};
