/* istanbul ignore file */
import axios, { AxiosError, CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios';

import { config } from '@/config';
import { useUserStore } from '@/store';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseConfig: CreateAxiosDefaults = {
  baseURL: config.apiURL,
  withCredentials: true,
};

export const instanceWithoutInterceptors = axios.create(baseConfig);

export const instance = axios.create(baseConfig);

instance.interceptors.request.use(
  function (config) {
    const accessToken = useUserStore.getState().user?.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error: AxiosError) {
    const originalRequest: CustomAxiosRequestConfig | undefined = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // TODO: call refresh token service (getRefreshToken)
        const payload = { accessToken: 'new' };
        useUserStore.setState({ user: { accessToken: payload.accessToken } });
        originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;

        return instance(originalRequest);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 403) {
          useUserStore.getState().removeCredentials();

          return;
        }
      }
    }

    return Promise.reject(error);
  },
);
