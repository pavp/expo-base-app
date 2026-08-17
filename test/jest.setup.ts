import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

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
