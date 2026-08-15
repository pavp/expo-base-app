import axios, { CreateAxiosDefaults } from 'axios';

import { config } from '@/config';

const baseConfig: CreateAxiosDefaults = {
  baseURL: config.apiURL,
  withCredentials: true,
};

// axios.create is the documented factory, not the named export.
// eslint-disable-next-line import/no-named-as-default-member
export const client = axios.create(baseConfig);

// client.interceptors.request.use(
//   function (config) {
//     const accessToken = getUserToken();

//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }

//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   },
// );

// client.interceptors.response.use(
//   function (response) {
//     return response;
//   },
//   async function (error: AxiosError) {
//     const originalRequest: CustomAxiosRequestConfig | undefined = error.config;

//     if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         // TODO: call refresh token service (getRefreshToken)
//         const payload = { accessToken: 'new' };
//         useUserStore.getState().actions.setCredentials({ accessToken: payload.accessToken });
//         originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;

//         return instance(originalRequest);
//       } catch (error) {
//         if (error instanceof AxiosError && error.response?.status === 403) {
//           useUserStore.getState().actions.removeCredentials();

//           return;
//         }
//       }
//     }

//     return Promise.reject(error);
//   },
// );
