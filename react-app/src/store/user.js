import { configureStore } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_USER_INFO':
      // If the action type is 'SET_USER_INFO', return a new state with userInfo updated
      return { ...state, userInfo: action.payload };
    default:
      // If the action type is anything else, return the current state unchanged
      return state;
  }
}

const store = configureStore({
  reducer
});

export default store;