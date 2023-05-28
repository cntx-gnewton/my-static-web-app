// Filename: store/actions.js
// Description: This file contains the actions that are dispatched to the store.
import User from '../models/user';

export const LOGOUT_USER = '[User] LOGOUT_USER';
export const LOGIN_USER = '[User] LOGIN_USER';

export const login = (clientPrincipal) => async (dispatch) => {
  console.log('logging in client:', clientPrincipal)
  const user = new User(clientPrincipal);
  console.log('logged in user:', user)
  await user.init();
  console.log('initialized user')
  dispatch({ type: LOGIN_USER, user: user });
}

export const logout = () => async (dispatch) => {
  dispatch({ type: LOGOUT_USER });
}