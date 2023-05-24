// store/user.actions.js

export const SET_USER_INFO = '[User] SET_USER_INFO';
export const SET_USER_INFO_SUCCESS = '[User] SET_USER_INFO_SUCCESS';
export const SET_USER_INFO_ERROR = '[User] SET_USER_INFO_ERROR';

export const UPLOAD_USER_SNP = '[Genome] UPLOAD_USER_SNP';
export const UPLOAD_USER_SNP_SUCCESS = '[Genome] UPLOAD_USER_SNP_SUCCESS';
export const UPLOAD_USER_SNP_ERRPR = '[Genome] UPLOAD_USER_SNP_ERRPR';

export const SET_USER_PRODUCTS = '[Products] SET_USER_PRODUCTS';
export const SET_USER_PRODUCTS_SUCCESS = '[Products] SET_USER_PRODUCTS_SUCCESS';
export const SET_USER_PRODUCTS_ERROR = '[Products] SET_USER_PRODUCTS_ERROR';

export const setUserInfo = (userInfo) => ({
  type: SET_USER_INFO,
  payload: userInfo,
});

export const setUserProducts = (userProducts) => ({
  type: SET_USER_PRODUCTS,
  payload: userProducts,
});
