/** @format */

import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const defaultState = {
  isConnected: true,
  isInternetReachable: true,
};

const useNetworkStatus = () => {
  const [network, setNetwork] = useState(defaultState);

  useEffect(() => {
    let mounted = true;

    const syncState = state => {
      if (!mounted) {
        return;
      }

      setNetwork({
        isConnected: Boolean(state?.isConnected),
        isInternetReachable: Boolean(
          state?.isInternetReachable ?? state?.isConnected,
        ),
      });
    };

    const unsubscribe = NetInfo.addEventListener(syncState);
    NetInfo.fetch().then(syncState);

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  return network;
};

export default useNetworkStatus;
