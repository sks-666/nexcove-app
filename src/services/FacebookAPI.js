/** @format */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { Config } from '@common';
import { log, toast } from '@app/Omni';

WebBrowser.maybeCompleteAuthSession();

const FB_OAUTH_VERSION = 'v19.0';
const redirectUri = AuthSession.makeRedirectUri();

let currentAccessToken = null;

const getAuthUrl = () => {
  const appId = Config?.appFacebookId;

  if (!appId) {
    return null;
  }

  return `https://www.facebook.com/${FB_OAUTH_VERSION}/dialog/oauth?client_id=${encodeURIComponent(
    appId,
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=public_profile,email`;
};

class FacebookAPI {
  async login() {
    const authUrl = getAuthUrl();

    if (!authUrl) {
      toast('Facebook login is not configured');
      return null;
    }

    const result = await AuthSession.startAsync({
      authUrl,
      returnUrl: redirectUri,
    });

    if (result?.type === 'success') {
      const token = result?.params?.access_token || null;
      currentAccessToken = token;
      return token;
    }

    return null;
  }

  logout() {
    currentAccessToken = null;
  }

  async getAccessToken() {
    return currentAccessToken;
  }

  async shareLink(link) {
    if (!link) {
      return;
    }

    toast('Facebook native share is deprecated in this build');
    log(`Requested share for link: ${link}`);
  }
}

export default new FacebookAPI();
