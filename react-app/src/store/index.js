// store/index.js

import * as actions from './user.actions'
import store from './user.store'
import { parseItem, parseList } from './utils'
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function useStore() {
  const dispatch = useDispatch();

  // Selectors
  const { creatingUser, userLoggedIn, userInfo, userProducts, userId, userProductCount } = useSelector((state) => ({
    userLoggedIn: state.userLoggedIn,
    userInfo: state.userInfo,
    userId: state.userId,
    userProducts: state.userProducts,
    userProductCount: state.userProductCount,
    creatingUser: state.creatingUser,
  }));

  // Dispatchers
  const setUserInfo = useCallback((userInfo) => { dispatch(actions.setUserInfo(userInfo)); }, [dispatch]);
  const setUserProducts = useCallback((userProducts) => { dispatch(actions.setUserProducts(userProducts)); }, [dispatch]);

  const createUser = useCallback((userInfo) => { dispatch(actions.createUser(userInfo)); }, [dispatch]);
  // const createProducts = useCallback((file) => { dispatch(actions.createProducts(file)); }, [dispatch]);
  const fetchUserInfo = useCallback((userId) => {dispatch(actions.fetchUserInfo(userId));}, [dispatch]);
  const fetchUserProducts = useCallback((userId) => {dispatch(actions.fetchUserProducts(userId));}, [dispatch]);
  
  const generateUserProducts = useCallback(async (userInfo, file) => {
    console.log('Running the pipeline')
    const products = await dispatch(actions.runUserPipeline(userInfo, file));
    if (products) {
      console.log('generated products:', products)
      dispatch(actions.setUserProducts(products));
    } else {
      console.log('no products generated', products)
    }
  }, [dispatch]);
//  How would you optimize the logical structure of this store-cosmosDB set up? GIve me three possible ways in which you could redesign my code that makes it more stable, readable, and easy to scale. SHould I make a user class that uses the store and the cosmos client? 
// I have a react app that is a staticwebapp in azure. I have a store and a cosmosDB client service.. I use azure aad and aadb2c to authenticate. I will first paste in my store code then, the next message i will send my cosmos client code. wait until I have sent you both to start thinking about the redesign. Here is my store:
  const initializeUser = useCallback(async (newUserInfo) => {
    console.log('logging in user',newUserInfo)
    const userId = newUserInfo.userId;
    if (!userLoggedIn) { // Check if the user is logged in
      console.log('user is not logged in, checking if user is in database', userId)
      const fetchedUserInfo = await dispatch(actions.fetchUserInfo(userId));
      console.log('user results', fetchedUserInfo)
      if (!fetchedUserInfo && !creatingUser) {
        console.log('user not found, creating user')
        await createUser(newUserInfo);
        await setUserInfo(newUserInfo)
        // dispatch(actions.createUser(userInfo));
      } else if (fetchedUserInfo) {
        console.log('user found, fetching user products')
        const userProducts = await fetchUserProducts(userId);
        console.log('setting user info and products to store',userProducts)
        await setUserInfo(fetchedUserInfo);
        if (userProducts) await setUserProducts(userProducts);
      }
    } else {
      console.log('user is already logged in', userId)
    }
  }, [dispatch,]); // Add creatingUser to the dependency array


  const logoutUser = useCallback(() => dispatch(actions.logoutUser()), [dispatch]); // add logout function

  return {
    // Selectors
    userInfo,
    userId,
    userProducts,
    
    userProductCount,
    userLoggedIn,

    // Dispatchers
    initializeUser,
    logoutUser,

    fetchUserInfo,
    fetchUserProducts,
    generateUserProducts,
  };
}


export {
    useStore,
    actions,
    store,
    parseItem,
    parseList
}