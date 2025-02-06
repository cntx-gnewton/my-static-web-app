// store/index.js

import * as actions from './user.actions'
import store from './user.store'
import { parseItem, parseList } from './utils'
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function useStore() {
  const dispatch = useDispatch();

  // // Dispatchers
  const setUser = useCallback((userInfo) => { dispatch(actions.setUser(userInfo)); }, [dispatch]);
  const pushUser = useCallback((userInfo) => { dispatch(actions.pushUser(userInfo)); }, [dispatch]);
  const pullUser = useCallback((userId) => { dispatch(actions.pullUser(userId)); }, [dispatch]);
  const logoutUser = useCallback(() => { dispatch(actions.logoutUser()); }, [dispatch])
  const userActions = {
    set: setUser,
    push: pushUser,
    pull: pullUser,
    logout:logoutUser,
  }

  const setProducts = useCallback((products) => { dispatch(actions.setProducts(products)); }, [dispatch]);
  const pushProducts = useCallback((userId, products) => { dispatch(actions.pushProducts(userId, products)); }, [dispatch]);
  const pullProducts = useCallback((userInfo) => { dispatch(actions.pullProducts(userInfo)); }, [dispatch]);
  const productActions = {
    set: setProducts,
    push: pushProducts,
    pull: pullProducts,
  }

  // Selectors
  const { creatingUser, loggedIn, userInfo, products, userId, productCount } = useSelector((state) => ({
    userId: state.userId,
    userInfo: state.userInfo,
    loggedIn: state.loggedIn,
    creatingUser: state.creatingUser,
    products: state.products,
    productCount: state.productCount,
  }));

  return {
    // Selectors
    userInfo,
    userId,
    products,
    
    productCount,
    loggedIn,
    creatingUser,

    // Dispatchers
    pullUser,
    userActions,
    productActions,
  };
}


export {
  useStore,
    actions,
    store,
    parseItem,
    parseList
}