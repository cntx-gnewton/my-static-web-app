// store/user.actions.js
import { useCosmos } from '../services';


export const SET_USER_INFO = '[User] SET_USER_INFO';
export const SET_USER_PRODUCTS = '[User] SET_USER_PRODUCTS';

export const setUserInfo = (userInfo) => ({
  type: SET_USER_INFO, payload: userInfo, userId: userInfo.userId,
});
export const setUserProducts = (userProducts) => ({
  type: SET_USER_PRODUCTS, payload: userProducts, 
});

export const FETCH_USER_INFO = '[User] FETCH_USER_INFO';
export const FETCH_USER_INFO_START = '[User] FETCH_USER_INFO';
export const FETCH_USER_INFO_SUCCESS = '[User] FETCH_USER_INFO_SUCCESS';
export const FETCH_USER_INFO_ERROR = '[User] FETCH_USER_INFO_ERROR';

export const CREATE_USER_START = '[User] CREATE_USER_START';
export const CREATE_USER_SUCCESS = '[User] CREATE_USER_SUCCESS';
export const CREATE_USER_ERROR = '[User] CREATE_USER_ERROR';

export const LOGOUT_USER = '[User] LOGOUT_USER';

export const UPLOAD_USER_SNP = '[Genome] UPLOAD_USER_SNP';
export const UPLOAD_USER_SNP_START = '[Genome] UPLOAD_USER_SNP_START';
export const UPLOAD_USER_SNP_SUCCESS = '[Genome] UPLOAD_USER_SNP_SUCCESS';
export const UPLOAD_USER_SNP_ERROR = '[Genome] UPLOAD_USER_SNP_ERROR';

export const FETCH_USER_PRODUCTS = '[Products] FETCH_USER_PRODUCTS';
export const FETCH_USER_PRODUCTS_START = '[Products] FETCH_USER_PRODUCTS_START';
export const FETCH_USER_PRODUCTS_SUCCESS = '[Products] FETCH_USER_PRODUCTS_SUCCESS';
export const FETCH_USER_PRODUCTS_ERROR = '[Products] FETCH_USER_PRODUCTS_ERROR';

// Add async action creators
export const fetchUserInfo = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_USER_INFO_START });
  try {
    const userInfo = await useCosmos().userDB.getUserInfoById(userId);
    if (userInfo) {
      console.log('userInfo: found:', userInfo)
      dispatch({ type: FETCH_USER_INFO_SUCCESS, payload: userInfo, userId: userInfo.userId });
      return userInfo;
    } else {
      console.log('userInfo: not_found', userInfo)
      dispatch({ type: FETCH_USER_INFO_ERROR, payload: null });
    }
  } catch (error) {
    console.log('fetchUserInfo: error',error)
    dispatch({ type: FETCH_USER_INFO_ERROR,  payload: error.message });
  }
};

export const fetchUserProducts = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_USER_PRODUCTS_START });
  try {
    const userProducts = await useCosmos().userDB.getUserProductsById(userId);
    console.log('fetchUserProducts: userProducts', userProducts)
    dispatch({ type: FETCH_USER_PRODUCTS_SUCCESS, payload: userProducts });
    return userProducts;
  } catch (error) {
    console.log('fetchUserProducts: error')
    dispatch({ type: FETCH_USER_PRODUCTS_ERROR,  payload: error.message });
  }
};

export const createUser = (userInfo) => async (dispatch) => {
  console.log('createUser: userInfo', userInfo)
  dispatch({ type: CREATE_USER_START });
  try {
    console.log('^success', userInfo)
    await useCosmos().createUser(userInfo);
    dispatch({ type: CREATE_USER_SUCCESS, payload: userInfo, userId: userInfo.userId});
  } catch (error) {
    console.log('^error', error.message)
    dispatch({ type: CREATE_USER_ERROR, payload: error.message });
  }
};

export const runUserPipeline = (userInfo, file) => async (dispatch) => {
  dispatch({ type: UPLOAD_USER_SNP_START });
  try {
    const products = await useCosmos().userPipeline(file);
    if (products) {
      console.log('runUserPipeline: products', products)
      await useCosmos().addUserProducts(userInfo.userId, products);
      dispatch({ type: UPLOAD_USER_SNP_SUCCESS, payload: products });
      return products;
    } else {
      dispatch({ type: UPLOAD_USER_SNP_ERROR, payload: null });
    }
  } catch (error) {
    dispatch({ type: UPLOAD_USER_SNP_ERROR,  payload: error.message });
  }
};

export const logoutUser = () => ({
  type: LOGOUT_USER,
});