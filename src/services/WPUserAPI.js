/** @format */

import { get, has } from 'lodash';

import { Config, Languages } from '@common';

import httpClient from './httpClient';

const url = Config.WooCommerce.url;
const isSecured = url.startsWith('https://');
const secure = isSecured ? '' : '&insecure=cool';
const cookieLifeTime = 120960000000;

const normalizeLegacyResponse = response => {
  if (!response?.error) {
    return response?.data;
  }

  return {
    error: response.error.message || Languages.ErrorMessageRequest,
    errorType: response.error.type,
    requestId: response.error.requestId,
  };
};

const request = (requestUrl, options = {}) =>
  httpClient(requestUrl, {
    timeoutMs: Config.Network.timeoutMs,
    retries: Config.Network.retries,
    retryDelayMs: Config.Network.retryDelayMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

const WPUserAPI = {
  login: async (username, password) => {
    const requestUrl = `${url}/wp-json/api/flutter_user/generate_auth_cookie`;

    const response = await request(requestUrl, {
      method: 'POST',
      body: JSON.stringify({
        second: cookieLifeTime,
        username,
        password,
      }),
    });

    return normalizeLegacyResponse(response);
  },

  loginFacebook: async token => {
    const requestUrl = `${url}/wp-json/api/flutter_user/fb_connect/?second=${cookieLifeTime}&access_token=${token}${secure}`;

    const response = await request(requestUrl);
    return normalizeLegacyResponse(response);
  },

  loginSMS: async token => {
    const requestUrl = `${url}/wp-json/api/flutter_user/sms_login/?access_token=${token}${secure}`;

    const response = await request(requestUrl);
    return normalizeLegacyResponse(response);
  },

  appleLogin: async (email, fullName, username) => {
    const requestUrl = `${url}/wp-json/api/flutter_user/apple_login?email=${email}&display_name=${fullName}&user_name=${username}${secure}`;

    const response = await request(requestUrl);
    return normalizeLegacyResponse(response);
  },

  register: async ({
    username,
    email,
    firstName,
    lastName,
    password = undefined,
  }) => {
    const requestUrl = `${url}/wp-json/api/flutter_user/register/`;

    const response = await request(requestUrl, {
      method: 'POST',
      body: JSON.stringify({
        username,
        user_login: username,
        user_email: email,
        email,
        display_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        password,
        user_pass: password,
      }),
    });

    if (response.error) {
      return normalizeLegacyResponse(response);
    }

    if (has(response.data, 'user_id')) {
      return response.data;
    }

    return { error: get(response.data, 'message') || Languages.CanNotRegister };
  },
};

export default WPUserAPI;
