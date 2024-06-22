import { api, API_ENDPOINT } from '@/api';

interface RefreshTokenAPIResponse {
  status: boolean;
  message: string;
  payload: {
    accessToken: string;
  };
}
export const getRefreshToken = api<void, RefreshTokenAPIResponse>({
  method: 'GET',
  path: API_ENDPOINT.REFRESH_TOKEN,
  type: 'public',
});
