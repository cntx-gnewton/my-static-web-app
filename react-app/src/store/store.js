// Filename: store/store.js
// Description: This file contains the store configuration and the hooks to access the store.
import { configureStore } from '@reduxjs/toolkit';

import {
  LOGIN_USER,
  LOGOUT_USER, // import the LOGOUT_USER action
} from './actions';

const initialState = {
  user: null,
  error: null,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_USER:
      console.log('Reducer LOGIN_USER', action.user)
      return { ...state, user: action.user, error: null, };
    case LOGOUT_USER:
      return { ...initialState };
    default:
      return state;
  }
}
const store = configureStore({
  reducer
});

export default store;