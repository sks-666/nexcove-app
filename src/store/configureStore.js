/** @format */

import Reactotron from 'reactotron-react-native';
import { configureStore } from '@reduxjs/toolkit';

import reducers from '@redux';
import { Constants } from '@common';
import { connectConsoleToReactotron, DEV_ENV } from '@app/Omni';
import './../../ReactotronConfig';

const createAppStore = () => {
  const isReactotronEnabled = DEV_ENV && Constants.useReactotron;

  const enhancers = defaultEnhancers => {
    if (isReactotronEnabled && Reactotron?.createEnhancer) {
      return [...defaultEnhancers, Reactotron.createEnhancer()];
    }
    return defaultEnhancers;
  };

  const store = configureStore({
    reducer: reducers,
    devTools: DEV_ENV,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
    enhancers,
  });

  if (isReactotronEnabled) {
    connectConsoleToReactotron();
  }

  return store;
};

export default createAppStore();
