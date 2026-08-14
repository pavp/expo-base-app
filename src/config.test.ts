import { config } from './config';

describe('config', () => {
  it('sets isTst to true under the Jest test environment', () => {
    expect(config.isTst).toBe(true);
  });

  it('exposes exactly one of isDev/isTst/isPrd as true', () => {
    const flags = [config.isDev, config.isTst, config.isPrd];

    expect(flags.filter(Boolean)).toHaveLength(1);
  });

  it('derives env from the same source as the booleans', () => {
    expect(config.env).toBe('test');
  });
});
