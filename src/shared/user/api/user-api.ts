import type { ApiOptions } from '@/api/api.types';
import { API_ENDPOINT } from '@/api/endpoints';
import { httpClient } from '@/api/http-client/http-client';

import type { User } from '../user.types';
import { UserArraySchema, UserSchema } from '../user.types';

export interface UserApiContract {
  getAll(options?: ApiOptions): Promise<User[]>;
  getById(id: number, options?: ApiOptions): Promise<User>;
}

// Service implementation with Zod response validation. There is no `requestSchema` counterpart:
// this module is read-only, so no operation here ever sends a request body to validate.
const createUserApiService = (): UserApiContract => ({
  async getAll(options) {
    return httpClient.get<User[]>(API_ENDPOINT.USERS, {
      responseSchema: UserArraySchema,
      signal: options?.signal,
    });
  },

  async getById(id, options) {
    return httpClient.get<User>(API_ENDPOINT.GET_USER + id, {
      responseSchema: UserSchema,
      signal: options?.signal,
    });
  },
});

export const userApi = createUserApiService();
