// Manual mock for the async-storage wrapper, resolved by `jest.mock('@/core/lib/async-storage')`
// with no factory. Covers every export, so a test that starts calling a
// different member cannot silently fall through to the real implementation and
// hit device storage.
export const setItem = jest.fn<Promise<void>, [string, unknown]>();
export const getItem = jest.fn<Promise<unknown | null>, [string]>();
export const removeItem = jest.fn<Promise<void>, [string]>();
export const mergeItem = jest.fn<Promise<void>, [string, unknown]>();
export const clear = jest.fn<Promise<void>, []>();
export const getAllKeys = jest.fn<Promise<readonly string[]>, []>();
export const getAllItems = jest.fn<Promise<Record<string, unknown>>, []>();
