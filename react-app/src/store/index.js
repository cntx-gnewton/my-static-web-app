// store/index.js

import * as actions from './user.actions'
import store from './user.store'
import { parseItem, parseList } from './utils'
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function useManage() {
  const dispatch = useDispatch();

  return {
    // Selectors
    userInfo: useSelector((state) => state.userInfo),
    userProducts: useSelector((state) => state.userProducts),

    // Dispatchers
    // Wrap any dispatcher that could be called within a useEffect() in a useCallback()
    // setUser: (clientPrincipal) => dispatch(actions.setUserInfo(clientPrincipal)),
    setProducts: (userProducts) => dispatch(actions.setUserProducts(userProducts)),
    setUser: useCallback((userInfo) => dispatch(actions.setUserInfo(userInfo)), [dispatch]), // called within a useEffect()
  };
}

export {
    useManage,
    actions,
    store,
    parseItem,
    parseList
}