import { AxiosInstance } from 'axios';
import { z } from 'zod';

import { config } from '@/config';

import { HttpClientContract, HttpValidationError, RequestConfig } from '../api.types';
import { client } from '../common/client';

const validate = <T>(data: unknown, responseSchema: z.ZodType | undefined, context: string): T => {
  if (!responseSchema) {
    return data as T;
  }

  const result = responseSchema.safeParse(data);

  if (!result.success) {
    if (config.isDev) {
      console.error(`[httpClient] ${context} failed schema validation`, result.error.issues);
    }

    throw new HttpValidationError(context, result.error.issues);
  }

  return result.data as T;
};

// `responseSchema` is validation metadata for httpClient itself, not an axios option — split it
// out so only genuine axios config reaches the underlying request.
const splitRequestConfig = (requestConfig?: RequestConfig) => {
  const { responseSchema, ...axiosConfig } = requestConfig ?? {};

  return { responseSchema, axiosConfig };
};

export const createAxiosHttpClient = (axiosInstance: AxiosInstance): HttpClientContract => ({
  get: async <T>(url: string, requestConfig?: RequestConfig): Promise<T> => {
    const { responseSchema, axiosConfig } = splitRequestConfig(requestConfig);
    const response = await axiosInstance.get(url, axiosConfig);

    return validate<T>(response.data, responseSchema, `GET ${url}`);
  },
  post: async <T>(url: string, data?: unknown, requestConfig?: RequestConfig): Promise<T> => {
    const { responseSchema, axiosConfig } = splitRequestConfig(requestConfig);
    const response = await axiosInstance.post(url, data, axiosConfig);

    return validate<T>(response.data, responseSchema, `POST ${url}`);
  },
  put: async <T>(url: string, data?: unknown, requestConfig?: RequestConfig): Promise<T> => {
    const { responseSchema, axiosConfig } = splitRequestConfig(requestConfig);
    const response = await axiosInstance.put(url, data, axiosConfig);

    return validate<T>(response.data, responseSchema, `PUT ${url}`);
  },
  delete: async <T>(url: string, requestConfig?: RequestConfig): Promise<T> => {
    const { responseSchema, axiosConfig } = splitRequestConfig(requestConfig);
    const response = await axiosInstance.delete(url, axiosConfig);

    return validate<T>(response.data, responseSchema, `DELETE ${url}`);
  },
});

export const httpClient = createAxiosHttpClient(client);
