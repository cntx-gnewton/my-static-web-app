// store/user.actions.js
import { userServices } from '../services';
const { db, api } = userServices();

export const SET_USER = '[User] SET_USER';
export const SET_PRODUCTS = '[User] SET_PRODUCTS';

export const setUser = (userInfo) => ({
  type: SET_USER, payload: userInfo, userId: userInfo.userId,
});
export const setProducts = (userProducts) => ({
  type: SET_PRODUCTS, payload: userProducts, 
});

// PUSH_USER
export const PUSH_USER_START = '[User] PUSH_USER_START';
export const PUSH_USER_SUCCESS = '[User] PUSH_USER_SUCCESS';
export const PUSH_USER_ERROR = '[User] PUSH_USER_ERROR';
// PULL_USER
export const PULL_USER = '[User] PULL_USER';
export const PULL_USER_START = '[User] PULL_USER_START';
export const PULL_USER_SUCCESS = '[User] PULL_USER_SUCCESS';
export const PULL_USER_ERROR = '[User] PULL_USER_ERROR';
// LOGOUT_USER
export const LOGOUT_USER = '[User] LOGOUT_USER';

// PUSH_PRODUCTS
export const PUSH_PRODUCTS = '[Products] PUSH_PRODUCTS';
export const PUSH_PRODUCTS_START = '[Products] PUSH_PRODUCTS_START';
export const PUSH_PRODUCTS_SUCCESS = '[Products] PUSH_PRODUCTS_SUCCESS';
export const PUSH_PRODUCTS_ERROR = '[Products] PUSH_PRODUCTS_ERROR';
// PULL_PRODUCTS
export const PULL_PRODUCTS = '[Products] PULL_PRODUCTS';
export const PULL_PRODUCTS_START = '[Products] PULL_PRODUCTS_START';
export const PULL_PRODUCTS_SUCCESS = '[Products] PULL_PRODUCTS_SUCCESS';
export const PULL_PRODUCTS_ERROR = '[Products] PULL_PRODUCTS_ERROR';
// GENERATE_PRODUCTS
export const GENERATE_PRODUCTS_START = '[Genome] GENERATE_PRODUCTS_START';
export const GENERATE_PRODUCTS_SUCCESS = '[Genome] GENERATE_PRODUCTS_SUCCESS';
export const GENERATE_PRODUCTS_ERROR = '[Genome] GENERATE_PRODUCTS_ERROR';


// Add async action creators
export const pullUser = (userId) => async (dispatch) => {
  console.log('actions.pullUser: userId', userId);
  const userInfo = await db.pullUser(userId);
  console.log('actions.pullUser: userInfo', userInfo)
  if (userInfo) {
    console.log('actions.pullUser: userInfo found:', userInfo);
    dispatch({ type: PULL_USER_SUCCESS });
    return userInfo;
  } else {
    console.log('actions.pullUser: userInfo not_found', userInfo);
    dispatch({ type: PULL_USER_ERROR, payload: null });
  }
};

export const pullProducts = (userAuthInfo) => async (dispatch) => {
  const userId = userAuthInfo.userId;
  dispatch({ type: PULL_PRODUCTS_START });
  try {
    const products = await db.pullProducts(userId);
    console.log('pullProducts:', products)
    dispatch({ type: PULL_PRODUCTS_SUCCESS });
    return products;
  } catch (error) {
    console.log('pullProducts: error')
    dispatch({ type: PULL_PRODUCTS_ERROR,  payload: error.message });
  }
};

export const pushUser = (userAuthInfo) => async (dispatch) => {
  console.log('actions.pushUser: userAuthInfo', userAuthInfo)
  dispatch({ type: PUSH_USER_START });
  try {
    await db.pushUser(userAuthInfo);
    console.log('^success', userAuthInfo)
    dispatch({ type: PUSH_USER_SUCCESS, payload: userAuthInfo, userId: userAuthInfo.userId});
  } catch (error) {
    console.log('^error', error.message)
    dispatch({ type: PUSH_USER_ERROR, payload: error.message });
  }
};

export const generateProducts = (file) => async (dispatch) => {
  dispatch({ type: GENERATE_PRODUCTS_START });
  try {
    const products = await api.runProductPipeline(file);
    if (products) {
      console.log('generateProducts: products', products)
      return products;
    } else {
      dispatch({ type: GENERATE_PRODUCTS_ERROR, payload: null });
    }
  } catch (error) {
    dispatch({ type: GENERATE_PRODUCTS_ERROR,  payload: error.message });
  }
};

export const pushProducts = (userId, products) => async (dispatch) => {
  dispatch({ type: PUSH_PRODUCTS_START });
  try {
    if (products) {
      await db.pushProducts(userId, products);
      dispatch({ type: PUSH_PRODUCTS_SUCCESS, payload: products });
      return products;
    } else {
      dispatch({ type: PUSH_PRODUCTS_ERROR, payload: null });
    }
  } catch (error) {
    dispatch({ type: PUSH_PRODUCTS_ERROR,  payload: error.message });
  }
};
export const logoutUser = () => ({
  type: LOGOUT_USER,
});