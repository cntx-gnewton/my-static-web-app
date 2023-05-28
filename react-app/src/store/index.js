// Filename: store/index.js
// Description: This file contains the store configuration and the hooks to access the store.
import * as actions from './actions'
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import store from './store';

function useStore() {
  const dispatch = useDispatch();
  // Selectors
  const { user, error } = useSelector((state) => ({
    user: state.user,
    error: state.error,
  }));
  // Dispatchers
  const loginUser = useCallback((userInfo) => { dispatch(actions.login(userInfo)); }, [dispatch]);
  const logoutUser = useCallback(() => dispatch(actions.logout()), [dispatch]);
  return {
    // Selectors
    user, error,
    // Dispatchers
    loginUser, logoutUser,
  };
}


export {
  useStore,
  store,
}