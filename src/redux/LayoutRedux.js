/** @format */

import { flatten } from 'lodash';
import { HorizonLayouts, Languages, Constants } from '@common';
import ProductAPI from '@services/ProductAPI';
import { getAppConfigJson } from '@app/services/Utils';


const mapNetworkErrorMessage = error => {
  if (!error) {
    return Languages.ProductsLoadError;
  }

  switch (error.type) {
    case 'NETWORK_ERROR':
      return Languages.NoConnection;
    case 'TIMEOUT_ERROR':
      return Languages.RequestTakingTooLong;
    case 'HTTP_ERROR':
      return error.status >= 500
        ? Languages.ServerErrorTryLater
        : error.message || Languages.ProductsLoadError;
    default:
      return error.message || Languages.ProductsLoadError;
  }
};

const types = {
  LAYOUT_FETCH_SUCCESS: 'LAYOUT_FETCH_SUCCESS',
  LAYOUT_FETCH_MORE: 'LAYOUT_FETCH_MORE',
  LAYOUT_FETCHING: 'LAYOUT_FETCHING',
  LAYOUT_ALL_FETCHING: 'LAYOUT_ALL_FETCHING',
  LAYOUT_ALL_FETCH_SUCCESS: 'LAYOUT_ALL_FETCH_SUCCESS',
  LAYOUT_HOME_FETCHING: 'LAYOUT_HOME_FETCHING',
  LAYOUT_HOME_SUCCESS: 'LAYOUT_HOME_SUCCESS',
  LAYOUT_HOME_FAILURE: 'LAYOUT_HOME_FAILURE',
  FETCH_PRODUCTS_FAILURE: 'FETCH_PRODUCTS_FAILURE',
};

export const actions = {
  fetchHomeLayouts: async (dispatch, url, enable) => {
    dispatch({ type: types.LAYOUT_HOME_FETCHING });

    const result = enable
      ? await getAppConfigJson(url)
      : { HorizonLayout: HorizonLayouts };

    if (result && result.HorizonLayout) {
      dispatch({
        type: types.LAYOUT_HOME_SUCCESS,
        data: result.HorizonLayout,
      });

      return;
    }

    dispatch({
      type: types.LAYOUT_HOME_FAILURE,
    });
  },

  fetchAllProductsLayout: async (dispatch, layouts, page = 1) => {
    dispatch({ type: types.LAYOUT_ALL_FETCHING });

    const promises = layouts.map((layout, index) => {
      if (layout.layout !== Constants.Layout.circleCategory) {
        return dispatch(
          actions.fetchProductsLayout(
            dispatch,
            layout.category,
            layout.tag,
            page,
            index,
          ),
        );
      }
    });

    Promise.all(promises).then(() => {
      dispatch({ type: types.LAYOUT_ALL_FETCH_SUCCESS });
    });
  },

  fetchProductsLayout: (dispatch, categoryId = '', tagId = '', page, index) => {
    // eslint-disable-next-line no-shadow
    return async dispatch => {
      dispatch({ type: types.LAYOUT_FETCHING, extra: { index } });

      const { data, error } = await ProductAPI.fetchProductsByCategoryTag({
        categoryId,
        tagId,
        page,
        perPage: 10,
      });

      if (error) {
        dispatch(actions.fetchProductsFailure(mapNetworkErrorMessage(error)));
        return;
      }

      const products = Array.isArray(data) ? data : [];

      dispatch({
        type: page > 1 ? types.LAYOUT_FETCH_MORE : types.LAYOUT_FETCH_SUCCESS,
        payload: products,
        extra: { index },
        finish: products.length === 0,
      });
    };
  },

  fetchProductsLayoutTagId: async (
    dispatch,
    categoryId = '',
    tagId = '',
    page,
    index,
  ) => {
    dispatch({ type: types.LAYOUT_FETCHING, extra: { index } });

    const { data, error } = await ProductAPI.fetchProductsByCategoryTag({
      categoryId,
      tagId,
      page,
      perPage: 10,
    });

    if (error) {
      dispatch(actions.fetchProductsFailure(mapNetworkErrorMessage(error)));
      return;
    }

    const products = Array.isArray(data) ? data : [];

    dispatch({
      type: page > 1 ? types.LAYOUT_FETCH_MORE : types.LAYOUT_FETCH_SUCCESS,
      payload: products,
      extra: { index },
      finish: products.length === 0,
    });
  },

  fetchProductsFailure: error => ({
    type: types.FETCH_PRODUCTS_FAILURE,
    error,
  }),
};

const initialState = {
  layout: [],
  isFetching: false,
  initializing: true,
};

export const reducer = (state = initialState, action) => {
  const { extra, type, payload, finish } = action;

  switch (type) {
    case types.LAYOUT_ALL_FETCHING: {
      return {
        ...state,
        isFetching: true,
      };
    }

    case types.LAYOUT_ALL_FETCH_SUCCESS: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case types.LAYOUT_FETCH_SUCCESS: {
      const layout = [];
      state.layout.map((item, index) => {
        if (index === extra.index) {
          layout.push({
            ...item,
            list: flatten(payload),
            isFetching: false,
          });
        } else {
          layout.push(item);
        }
      });
      return {
        ...state,
        layout,
      };
    }

    case types.LAYOUT_FETCH_MORE: {
      const layout = [];
      state.layout.map((item, index) => {
        if (index === extra.index) {
          layout.push({
            ...item,
            list: item.list.concat(payload),
            isFetching: false,
            finish,
          });
        } else {
          layout.push(item);
        }
      });
      return {
        ...state,
        layout,
      };
    }

    case types.LAYOUT_FETCHING: {
      const layout = [];
      state.layout.map((item, index) => {
        if (index === extra.index) {
          layout.push({
            ...item,
            isFetching: true,
          });
        } else {
          layout.push(item);
        }
      });
      return {
        ...state,
        layout,
      };
    }

    // initialize json file
    case types.LAYOUT_HOME_FETCHING: {
      return {
        ...state,
        initializing: true,
      };
    }

    case types.LAYOUT_HOME_SUCCESS: {
      return {
        ...state,
        layout: action.data,
        initializing: false,
      };
    }

    case types.LAYOUT_HOME_FAILURE: {
      return {
        ...state,
        initializing: false,
      };
    }


    case types.FETCH_PRODUCTS_FAILURE: {
      const layout = state.layout.map(item => ({
        ...item,
        isFetching: false,
      }));

      return {
        ...state,
        layout,
        error: action.error,
      };
    }

    default:
      return state;
  }
};
