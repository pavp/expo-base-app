import '@/styles/unistyles';
import '@shopify/flash-list/jestSetup';

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
