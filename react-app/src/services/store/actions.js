// store/user.actions.js
import { useApi, useUserDB } from '..';
const { userDB } = useUserDB();
const { runProductPipeline } = useApi();

export const SET_USER = '[User] SET_USER';
export const SET_PRODUCTS = '[User] SET_PRODUCTS';

export function getUserId(userInfo) {
  try { return userInfo.userId; }
  catch (e) { return userInfo['id']; }
}

export const setUser = (userInfo) => ({
  type: SET_USER, payload: userInfo, userId: getUserId(userInfo),
});

export const setProducts = (userProducts) => ({
  type: SET_PRODUCTS, payload: userProducts, 
});

/////////////////////////////////////////////
// User Actions
/////////////////////////////////////////////

// PUSH
export const PUSH_USER_START = '[User] PUSH_USER_START';
export const PUSH_USER_SUCCESS = '[User] PUSH_USER_SUCCESS';
export const PUSH_USER_ERROR = '[User] PUSH_USER_ERROR';
// PULL
export const PULL_USER = '[User] PULL_USER';
export const PULL_USER_START = '[User] PULL_USER_START';
export const PULL_USER_SUCCESS = '[User] PULL_USER_SUCCESS';
export const PULL_USER_ERROR = '[User] PULL_USER_ERROR';
// LOGOUT
export const LOGOUT_USER = '[User] LOGOUT_USER';

// ///////////////////////////////////////////
// Products Actions
// ///////////////////////////////////////////

// PUSH
export const PUSH_PRODUCTS = '[Products] PUSH_PRODUCTS';
export const PUSH_PRODUCTS_START = '[Products] PUSH_PRODUCTS_START';
export const PUSH_PRODUCTS_SUCCESS = '[Products] PUSH_PRODUCTS_SUCCESS';
export const PUSH_PRODUCTS_ERROR = '[Products] PUSH_PRODUCTS_ERROR';
// PULL
export const PULL_PRODUCTS = '[Products] PULL_PRODUCTS';
export const PULL_PRODUCTS_START = '[Products] PULL_PRODUCTS_START';
export const PULL_PRODUCTS_SUCCESS = '[Products] PULL_PRODUCTS_SUCCESS';
export const PULL_PRODUCTS_ERROR = '[Products] PULL_PRODUCTS_ERROR';
// GENERATE
export const GENERATE_PRODUCTS_START = '[Genome] GENERATE_PRODUCTS_START';
export const GENERATE_PRODUCTS_SUCCESS = '[Genome] GENERATE_PRODUCTS_SUCCESS';
export const GENERATE_PRODUCTS_ERROR = '[Genome] GENERATE_PRODUCTS_ERROR';

// ///////////////////////////////////////////
// Survey Actions
// ///////////////////////////////////////////
// SHOW
export const SHOW_SURVEY = '[Survey] SHOW_SURVEY';
export const showSurvey = () => ({
  type: SHOW_SURVEY,
});
// HIDE
export const HIDE_SURVEY = '[Survey] HIDE_SURVEY';
export const hideSurvey = () => ({
  type: HIDE_SURVEY,
});
// SET
export const SET_SURVEY = '[User] SET_SURVEY';
export const setSurvey = (userSurvey) => ({
  type: SET_SURVEY, payload: userSurvey, 
});
// PUSH
export const PUSH_SURVEY_START = '[User] PUSH_SURVEY_START';
export const PUSH_SURVEY_SUCCESS = '[User] PUSH_SURVEY_SUCCESS';
export const PUSH_SURVEY_ERROR = '[User] PUSH_SURVEY_ERROR';

export const pushSurvey = (survey, userId) => async (dispatch) => {
  console.log(`actions.pushSurvey: survey | ${survey}/${survey.data} | userId | ${userId}`)
  dispatch({ type: PUSH_SURVEY_START });
  try {
      const { userDB } = useUserDB(); // Send data to server
      try {
        await userDB.pushSurveyData(userId, survey); // Update database
        // setSurvey(data); // Update local state
        console.log(`actions.pushSurvey: data | ${survey}`)
        dispatch({ type: PUSH_SURVEY_SUCCESS, payload: survey });
      }
      catch (error) {
        console.error(`Error pushing survey data for user ${userId}:`, error);
        dispatch({ type: PUSH_SURVEY_ERROR, payload: error.message });
      }
    } catch (error) {
        console.error(`Error pushing survey data for user ${userId}:`, error);
        dispatch({ type: PUSH_SURVEY_ERROR, payload: error.message });
    }
};

// ///////////////////////////////////////////
// Action Creators
// ///////////////////////////////////////////


// Add async action creators
export const pullUser = (userId) => async (dispatch) => {
  console.log('actions.pullUser: userId', userId)
  dispatch({ type: PULL_USER_START });
  try {
    const userInfo = await userDB.pullUser(userId);
    console.log(`actions.pullUser: userId: ${userId} userInfo: ${userInfo}`)
    dispatch({ type: PULL_USER_SUCCESS, payload: userInfo });
    return userInfo;
  }
  catch (error) {
    console.log(`pullUser: error`)
    dispatch({ type: PULL_USER_ERROR, payload: null });
  } 
};

export const pullProducts = (userAuthInfo) => async (dispatch) => {
  const userId = userAuthInfo.userId;
  dispatch({ type: PULL_PRODUCTS_START });
  try {
    const products = await userDB.pullProducts(userId);
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
    await userDB.pushUser(userAuthInfo);
    console.log('^success')
    dispatch({ type: PUSH_USER_SUCCESS, payload: userAuthInfo});
  } catch (error) {
    console.log('^error', error.message)
    dispatch({ type: PUSH_USER_ERROR, payload: error.message });
  }
};

export const generateProducts = (file, surveyData) => async (dispatch) => {
  dispatch({ type: GENERATE_PRODUCTS_START });
  try {
    const products = await runProductPipeline(file, surveyData);
    if (products) {
      console.log(`generateProducts: products: ${products} | surveyData: ${surveyData}`, )
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
      await userDB.pushProducts(userId, products);
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