// store/user.store.js

import { configureStore } from '@reduxjs/toolkit';
import {
  SET_USER_INFO,
  SET_USER_PRODUCTS,

  CREATE_USER_START,
  CREATE_USER_SUCCESS,
  CREATE_USER_ERROR,

  FETCH_USER_INFO_START,
  FETCH_USER_INFO_SUCCESS,
  FETCH_USER_INFO_ERROR,

  FETCH_USER_PRODUCTS_START,
  FETCH_USER_PRODUCTS_SUCCESS,
  FETCH_USER_PRODUCTS_ERROR,
  
  LOGOUT_USER, // import the LOGOUT_USER action
} from './user.actions';

const initialState = {
  userId: null,
  userInfo: null,
  userLoggedIn: false,
  creatingUser: false,
  userProducts: [],
  productCount: 0,
};

function reducer(state = initialState, action) {
  switch (action.type) {

    case SET_USER_INFO:
      return { ...state, userInfo: action.payload, userId: action.userId };
    case SET_USER_PRODUCTS:
      return { ...state, userProducts: action.payload, productCount: action.payload.length };

    case CREATE_USER_START:
      return { ...state, creatingUser: true };
    case CREATE_USER_SUCCESS:
      return { ...state, creatingUser: false, loggedIn: true, userInfo: action.payload, userId: action.userId,  };
    case CREATE_USER_ERROR:
      return { ...state, creatingUser: false, error: action.payload };
    
    case FETCH_USER_INFO_START:
    case FETCH_USER_INFO_SUCCESS:
      return { ...state, userInfo: action.payload, userId: action.userId, loading: false, loggedIn: true };
    case FETCH_USER_INFO_ERROR:
      return { ...state, error: action.error, loading: false };
    
    case FETCH_USER_PRODUCTS_START:
      return { ...state, loading: true, error: null };
    case FETCH_USER_PRODUCTS_SUCCESS:
      return { ...state, userProducts: action.payload, productCount: action.payload.length, loading: false };
    case FETCH_USER_PRODUCTS_ERROR:
      return { ...state, error: action.error, loading: false };
    
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