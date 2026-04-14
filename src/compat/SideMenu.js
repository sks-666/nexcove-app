/** @format */

import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

const SideMenu = ({
  open,
  onClose,
  content,
  children,
  openDrawerOffset = 0.3,
  tapToClose = true,
  styles,
}) => {
  const drawerWidth = `${Math.round((1 - openDrawerOffset) * 100)}%`;

  return (
    <View style={baseStyles.container}>
      {children}
      <Modal visible={Boolean(open)} transparent animationType="slide">
        <View style={baseStyles.overlay}>
          {tapToClose && <Pressable style={baseStyles.backdrop} onPress={onClose} />}
          <View style={[baseStyles.drawer, { width: drawerWidth }, styles?.drawer]}>
            {content}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawer: {
    height: '100%',
    backgroundColor: '#fff',
  },
});

export default SideMenu;
