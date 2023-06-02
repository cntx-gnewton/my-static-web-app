// store/user.store.js

import { configureStore } from '@reduxjs/toolkit';
import {
  SET_USER,
  SET_PRODUCTS,

  PUSH_USER_START,
  PUSH_USER_SUCCESS,
  PUSH_USER_ERROR,
  PULL_USER_START,
  PULL_USER_SUCCESS,
  PULL_USER_ERROR,
  LOGOUT_USER, 

  PUSH_PRODUCTS_START,
  PUSH_PRODUCTS_SUCCESS,
  PUSH_PRODUCTS_ERROR,
  PULL_PRODUCTS_START,
  PULL_PRODUCTS_SUCCESS,
  PULL_PRODUCTS_ERROR,
  GENERATE_PRODUCTS_START,
  GENERATE_PRODUCTS_SUCCESS,
  GENERATE_PRODUCTS_ERROR,

  SHOW_SURVEY,
  HIDE_SURVEY,
  
} from './actions';

const initialState = {
  id: null,
  name: null,
  userInfo: null,
  loggedIn: false,
  creatingUser: false,
  products: [],
  productCount: 0,
  showSurvey: false,
};

function reducer(state = initialState, action) {
  switch (action.type) {

    case SET_USER:
      return { ...state, userInfo: action.payload, userId: action.userId, loggedIn: true };
    case SET_PRODUCTS:
      return { ...state, products: action.payload, productCount: action.payload.length };

    case PUSH_USER_START:
      return { ...state, creatingUser: true };
    case PUSH_USER_SUCCESS:
      return { ...state, creatingUser: false, loggedIn: true, userInfo: action.payload, userId: action.userId,};
    case PUSH_USER_ERROR:
      return { ...state, creatingUser: false, error: action.payload };
    
    case PULL_USER_START:
      return { ...state, loading: true};
    case PULL_USER_SUCCESS:
      return { ...state, loading: false, loggedIn: true };
    case PULL_USER_ERROR:
      return { ...state, error: action.error, loading: false };
    
    case PUSH_PRODUCTS_START:
      return { ...state, loading: true, error: null };
    case PUSH_PRODUCTS_SUCCESS:
      return { ...state, products: action.payload, productCount: action.payload.length, loading: false };
    case PUSH_PRODUCTS_ERROR:
      return { ...state, error: action.error, loading: false };
    case GENERATE_PRODUCTS_START:
      return { ...state, loading: true, error: null };
    case GENERATE_PRODUCTS_SUCCESS:
      return { ...state, loading: false };
    case GENERATE_PRODUCTS_ERROR:
      return { ...state, error: action.error, loading: false };
    
    case PULL_PRODUCTS_START:
      return { ...state, loading: true, error: null };
    case PULL_PRODUCTS_SUCCESS:
      return { ...state,  loading: false };
    case PULL_PRODUCTS_ERROR:
      return { ...state, error: action.error, loading: false };
    
    case LOGOUT_USER:
      return { ...initialState };
    
    case SHOW_SURVEY:
      return { ...state, showSurvey: true };
    case HIDE_SURVEY:
      return { ...state, showSurvey: false };

    default:
      return state;
  }
}

const store = configureStore({
  reducer
});

export default store;