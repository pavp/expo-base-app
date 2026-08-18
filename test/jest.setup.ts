import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// `Keyboard` extends the auto-mocked NativeEventEmitter above, so `addListener` returns `undefined`
// and any component that unsubscribes on unmount — `KeyboardAvoidingView` does — throws. Hand back a
// real subscription shape so the teardown has something to call.
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  removeAllListeners: jest.fn(),
  dismiss: jest.fn(),
  scheduleLayoutAnimation: jest.fn(),
  isVisible: jest.fn().mockReturnValue(false),
  metrics: jest.fn(),
}));

jest.mock('@expo/vector-icons/Ionicons', () => {
  return {
    __esModule: true,
    default: jest.fn().mockReturnValue(null),
  };
});

jest.mock('@dev-plugins/react-query', () => ({
  createQuery: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
}));

// The mock is a module-level map shared by every test in a file. Without this, isolation between
// persisted stores would rest on each test happening to pick a different persistence key.
afterEach(async () => {
  await AsyncStorage.clear();
});
