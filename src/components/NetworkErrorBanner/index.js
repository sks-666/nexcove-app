/** @format */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Languages } from '@common';

const NetworkErrorBanner = ({ isConnected = true }) => {
  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{Languages.NoConnection}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#B00020',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NetworkErrorBanner;
