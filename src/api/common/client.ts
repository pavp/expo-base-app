import axios, { CreateAxiosDefaults } from 'axios';

import { config } from '@/config';

const baseConfig: CreateAxiosDefaults = {
  baseURL: config.apiURL,
};

// axios.create is the documented factory, not the named export.
// eslint-disable-next-line import/no-named-as-default-member
export const client = axios.create(baseConfig);
