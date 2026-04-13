/** @format */

import { Config } from '@common';

import httpClient from './httpClient';

function WordpressAPI(opt) {
  if (!(this instanceof WordpressAPI)) {
    return new WordpressAPI(opt);
  }

  this._setDefaultsOptions(opt || {});
}

WordpressAPI.prototype._setDefaultsOptions = function (opt) {
  this.url = opt.url ? opt.url : Config.WooCommerce.url;
};

WordpressAPI.prototype.join = (obj, separator) => {
  const arr = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      arr.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(obj[key] ?? '')}`,
      );
    }
  }

  return arr.join(separator);
};

WordpressAPI.prototype._request = function (url) {
  return httpClient(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    timeoutMs: Config.Network.timeoutMs,
    retries: Config.Network.retries,
    retryDelayMs: Config.Network.retryDelayMs,
  });
};

WordpressAPI.prototype.createComment = async function (data, callback) {
  let requestUrl = `${this.url}/wp-json/api/flutter_user/post_comment/?insecure=cool`;

  if (data) {
    requestUrl += `&${this.join(data, '&')}`;
  }

  const response = await this._request(requestUrl);

  if (typeof callback === 'function') {
    callback();
  }

  return response;
};

WordpressAPI.prototype.getCheckoutUrl = async function (data, callback) {
  const requestUrl = `${this.url}/wp-json/api/flutter_user/checkout`;

  const response = await httpClient(requestUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    timeoutMs: Config.Network.timeoutMs,
    retries: Config.Network.retries,
    retryDelayMs: Config.Network.retryDelayMs,
  });

  if (!response.error && typeof callback === 'function') {
    callback(`${this.url}/checkout?code=${response.data}&mobile=true`);
  }

  return response;
};

export default new WordpressAPI();
