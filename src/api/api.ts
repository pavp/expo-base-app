import { AxiosRequestConfig, Method } from 'axios';

import { instance, instanceWithoutInterceptors } from '@/lib/axios';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface APICallPayload<Request, Response> {
  method: Method;
  path: string;
  type?: 'private' | 'public';
}

export function api<Request, Response>({ type = 'private', method, path }: APICallPayload<Request, Response>) {
  return async (requestData: Request) => {
    // Prepare API call
    let url = path;
    let data = null;

    if (requestData) {
      if (method === 'GET' || method === 'DELETE') {
        url += `${requestData}`;
      } else {
        data = requestData;
      }
    }

    const config: AxiosRequestConfig = {
      method,
      url,
      data,
    };

    // Make API call based on the type of request
    const response = type === 'private' ? await instance(config) : await instanceWithoutInterceptors(config);

    return response.data as Response;
  };
}
