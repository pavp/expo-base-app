import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { secureStorage } from './secure-storage.lib';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('secureStorage', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
    jest.clearAllMocks();
  });

  describe('on native (iOS/Android)', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('delegates getItem to SecureStore.getItemAsync', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored-value');

      const value = await secureStorage.getItem('user');

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('user');
      expect(value).toBe('stored-value');
    });

    it('returns null when the key is missing, rather than throwing', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const value = await secureStorage.getItem('missing-key');

      expect(value).toBeNull();
    });

    it('delegates setItem to SecureStore.setItemAsync', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await secureStorage.setItem('user', 'a-token');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user', 'a-token');
    });

    it('delegates removeItem to SecureStore.deleteItemAsync', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await secureStorage.removeItem?.('user');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user');
    });
  });

  describe('on web (no SecureStore native module)', () => {
    beforeEach(() => {
      Platform.OS = 'web';
    });

    it('does not call SecureStore.getItemAsync and returns null instead of throwing', async () => {
      const value = await secureStorage.getItem('user');

      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
      expect(value).toBeNull();
    });

    it('does not call SecureStore.setItemAsync and resolves instead of throwing', async () => {
      await expect(secureStorage.setItem('user', 'a-token')).resolves.toBeUndefined();

      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('does not call SecureStore.deleteItemAsync and resolves instead of throwing', async () => {
      await expect(secureStorage.removeItem?.('user')).resolves.toBeUndefined();

      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });
  });
});
