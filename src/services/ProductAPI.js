/** @format */

import { Config } from '@common';

import httpClient from './httpClient';

const buildWooAuthQuery = () => {
  const params = new URLSearchParams();
  params.append('consumer_key', Config.WooCommerce.consumerKey);
  params.append('consumer_secret', Config.WooCommerce.consumerSecret);
  return params;
};

const buildProductsUrl = ({ categoryId = '', tagId = '', page = 1, perPage = 10 }) => {
  const params = buildWooAuthQuery();

  if (categoryId) {
    params.append('category', categoryId);
  }
  if (tagId) {
    params.append('tag', tagId);
  }

  params.append('page', page);
  params.append('per_page', perPage);

  return `${Config.WooCommerce.url}/${Config.WooCommerce.apiVersion}/products?${params.toString()}`;
};

const ProductAPI = {
  fetchProductsByCategoryTag: async ({ categoryId = '', tagId = '', page = 1, perPage = 10 }) => {
    const url = buildProductsUrl({ categoryId, tagId, page, perPage });

    return httpClient(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      timeoutMs: Config.Network.timeoutMs,
      retries: Config.Network.retries,
      retryDelayMs: Config.Network.retryDelayMs,
    });
  },
};

export default ProductAPI;
