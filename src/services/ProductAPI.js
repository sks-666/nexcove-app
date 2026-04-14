/** @format */

import { Config } from '@common';

import httpClient from './httpClient';

const appendWooAuth = params => {
  params.append('consumer_key', Config.WooCommerce.consumerKey);
  params.append('consumer_secret', Config.WooCommerce.consumerSecret);
};

const ProductAPI = {

  fetchProductById: productId => {
    const params = new URLSearchParams();
    appendWooAuth(params);

    const url = `${Config.WooCommerce.url}/${Config.WooCommerce.apiVersion}/products/${productId}?${params.toString()}`;

    return httpClient(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeoutMs: Config.Network.timeoutMs,
      retries: Config.Network.retries,
      retryDelayMs: Config.Network.retryDelayMs,
    });
  },

  fetchProductsByCategoryTag: ({ categoryId = '', tagId = '', page = 1, perPage = 10 }) => {
    const params = new URLSearchParams();

    appendWooAuth(params);

    if (categoryId) {
      params.append('category', String(categoryId));
    }

    if (tagId) {
      params.append('tag', String(tagId));
    }

    params.append('page', String(page));
    params.append('per_page', String(perPage));

    const url = `${Config.WooCommerce.url}/${Config.WooCommerce.apiVersion}/products?${params.toString()}`;

    return httpClient(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeoutMs: Config.Network.timeoutMs,
      retries: Config.Network.retries,
      retryDelayMs: Config.Network.retryDelayMs,
    });
  },
};

export default ProductAPI;
