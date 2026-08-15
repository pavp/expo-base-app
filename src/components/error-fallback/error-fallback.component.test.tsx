import { fireEvent, renderWithProviders, screen } from '@/test/test-utils';

import { ErrorFallback } from './error-fallback.component';

describe('ErrorFallback', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // i18n is not initialised under jest, so `t` echoes the key back. Asserting on
  // the keys still proves the copy is translated rather than hardcoded.
  it('renders the translated copy and the retry button', async () => {
    await renderWithProviders(<ErrorFallback error={new Error('boom')} retry={jest.fn()} />);

    expect(screen.getByTestId('error-fallback')).toBeTruthy();
    expect(screen.getByTestId('error-fallback-retry')).toBeTruthy();
    expect(screen.getByText('errorBoundary.title')).toBeTruthy();
    expect(screen.getByText('errorBoundary.description')).toBeTruthy();
    expect(screen.getByText('errorBoundary.retry')).toBeTruthy();
  });

  it('shows the error message so a crash is never silent', async () => {
    await renderWithProviders(<ErrorFallback error={new Error('boom')} retry={jest.fn()} />);

    expect(screen.getByText('boom')).toBeTruthy();
  });

  it('calls retry when the retry button is pressed', async () => {
    const retry = jest.fn().mockResolvedValue(undefined);

    await renderWithProviders(<ErrorFallback error={new Error('boom')} retry={retry} />);

    await fireEvent.press(screen.getByTestId('error-fallback-retry'));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('logs the error to console.error', async () => {
    const error = new Error('boom');

    await renderWithProviders(<ErrorFallback error={error} retry={jest.fn()} />);

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('ErrorFallback'), error);
  });

  it('logs once per error rather than on every render', async () => {
    const error = new Error('boom');

    const { rerender } = await renderWithProviders(<ErrorFallback error={error} retry={jest.fn()} />);

    rerender(<ErrorFallback error={error} retry={jest.fn()} />);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });
});
