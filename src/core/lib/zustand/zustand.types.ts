import type { Draft } from 'immer';
import type { StateStorage } from 'zustand/middleware';

export interface StoreOptions<T extends object> {
  persist?: boolean;
  immer?: boolean;
  storage?: StateStorage;
  exclude?: Exclude<keyof T, 'actions'>[];
}

/**
 * The `set` a store creator receives. Accepts both zustand's partial-update forms and immer's
 * mutable draft, because the factory decides at runtime whether the immer middleware is applied.
 */
export type ZustandSet<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>) | ((draft: Draft<T>) => void),
  replace?: boolean,
) => void;
