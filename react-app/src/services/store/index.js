// store/index.js

import * as actions from './actions'
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function useDispatchers() {
  const dispatch = useDispatch();

  const surveyActions = {
    show: useCallback(() => { dispatch(actions.showSurvey()); }, [dispatch]),
    hide: useCallback(() => { dispatch(actions.hideSurvey()); }, [dispatch]),
    set:  useCallback((surveyData) => { dispatch(actions.setSurvey(surveyData)); }, [dispatch]),
    push: useCallback((survey, userId) => { dispatch(actions.pushSurvey(survey, userId)); }, [dispatch]),
  }

  const userActions = {
    set: useCallback((userInfo) => { dispatch(actions.setUser(userInfo)); }, [dispatch]),
    push: useCallback((userInfo) => { dispatch(actions.pushUser(userInfo)); }, [dispatch]),
    pull: useCallback((userId) => { dispatch(actions.pullUser(userId)); }, [dispatch]),
    logout: useCallback(() => { dispatch(actions.logoutUser()); }, [dispatch]),
  }
  
  const productActions = {
    set: useCallback((products) => { dispatch(actions.setProducts(products)); }, [dispatch]),
    push: useCallback((userId, products) => { dispatch(actions.pushProducts(userId, products)); }, [dispatch]),
    pull: useCallback((userInfo) => { dispatch(actions.pullProducts(userInfo)); }, [dispatch]),
  }
  return {
    surveyActions,
    userActions,
    productActions
  }
}

function useSelectors() {
  const { creatingUser, loggedIn, userInfo, products, userId, displayName, productCount, showSurvey, surveyData } = useSelector((state) => ({
    userId: state.userId,
    displayName: state.displayName,
    userInfo: state.userInfo,
    loggedIn: state.loggedIn,
    creatingUser: state.creatingUser,
    products: state.products,
    productCount: state.productCount,
    showSurvey: state.showSurvey,
    surveyData: state.surveyData,
  }));

  return {
    userInfo,
    userId,
    displayName,
    products,
    productCount,
    loggedIn,
    creatingUser,
    showSurvey,
    surveyData
  }
}

export function useStore() {
  const dispatchers = useDispatchers();
  const selectors = useSelectors();
  return {
    dispatchers,
    selectors
  }
}