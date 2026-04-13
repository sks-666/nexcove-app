/** @format */

import { Config } from '@common';

import httpClient from './httpClient';

const buildOrdersUrl = () => {
  const params = new URLSearchParams();
  params.append('consumer_key', Config.WooCommerce.consumerKey);
  params.append('consumer_secret', Config.WooCommerce.consumerSecret);

  return `${Config.WooCommerce.url}/${Config.WooCommerce.apiVersion}/orders?${params.toString()}`;
};

const CheckoutAPI = {
  createOrder: payload => {
    const url = buildOrdersUrl();

    return httpClient(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeoutMs: Config.Network.timeoutMs,
      retries: Config.Network.retries,
      retryDelayMs: Config.Network.retryDelayMs,
    });
  },
};

export default CheckoutAPI;
