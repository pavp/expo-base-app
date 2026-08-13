jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => ({
  ...jest.requireActual('@shopify/flash-list/dist/recyclerview/utils/measureLayout'),
  measureParentSize: jest.fn().mockImplementation(() => ({ x: 0, y: 0, width: 400, height: 900 })),
  measureFirstChildLayout: jest.fn().mockImplementation(() => ({ x: 0, y: 0, width: 400, height: 900 })),
  measureItemLayout: jest.fn().mockImplementation(() => ({ x: 0, y: 0, width: 100, height: 100 })),
}));

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
