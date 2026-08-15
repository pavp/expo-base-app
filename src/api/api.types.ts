import type { AxiosRequestConfig } from 'axios';
import type { z } from 'zod';

export interface RequestConfig extends Omit<AxiosRequestConfig, 'data'> {
  responseSchema?: z.ZodType;
}

/** Shared per-call options every api-layer operation accepts, so cancellation stays uniform. */
export interface ApiOptions {
  signal?: AbortSignal;
}

export interface HttpClientContract {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

export class HttpValidationError extends Error {
  constructor(
    readonly context: string,
    readonly issues: z.core.$ZodIssue[],
  ) {
    super(`Validation failed: ${context}`);
    this.name = 'HttpValidationError';
  }
}
