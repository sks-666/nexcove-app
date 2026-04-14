/** @format */

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { View } from 'react-native';

const ScrollableTabView = forwardRef(
  ({ children, initialPage = 0, onChangeTab, style }, ref) => {
    const pages = useMemo(() => React.Children.toArray(children), [children]);
    const [index, setIndex] = useState(initialPage);

    useEffect(() => {
      if (typeof onChangeTab === 'function') {
        onChangeTab({ i: index });
      }
    }, [index, onChangeTab]);

    useImperativeHandle(ref, () => ({
      goToPage: nextIndex => {
        if (typeof nextIndex !== 'number') {
          return;
        }
        const boundedIndex = Math.max(0, Math.min(nextIndex, pages.length - 1));
        setIndex(boundedIndex);
      },
    }));

    return <View style={[{ flex: 1 }, style]}>{pages[index] || null}</View>;
  },
);

export default ScrollableTabView;
