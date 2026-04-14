/** @format */

import axios from 'axios';

import Config from '@common/Config';

const apiClient = axios.create({
  baseURL: Config.WooCommerce.url,
  timeout: Config.Network?.timeoutMs || 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    const normalizedError = {
      message: error?.message || 'Network error',
      status: error?.response?.status,
      data: error?.response?.data,
      url: error?.config?.url,
    };

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
