// store/user.store.js

import { configureStore } from '@reduxjs/toolkit';
import {
  SET_USER_INFO,
  SET_USER_PRODUCTS
} from './user.actions';

const initialState = {
  userInfo: null,
  userProducts: [], // add a new state for user products
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER_INFO:
      return { ...state, userInfo: action.payload };
    case SET_USER_PRODUCTS: // add a new case for setting user products
      return { ...state, userProducts: action.payload };
    default:
      return state;
  }
}

const store = configureStore({
  reducer
});

export default store;