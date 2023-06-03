import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom'; 
import { getUserAuthInfo } from '../services/api';
import { useStore, useUserDB } from '../services';

const NavBar = () => {
  const { userDB } = useUserDB(); // get userDB from useUserDB
  const { dispatchers, selectors } = useStore();
  const { userActions, productActions, surveyActions } = dispatchers;
  const { userInfo, loggedIn } = selectors;

  const profileRedirect = '/profile';
  const homeRedirect = '/home';
  const loginURI = `/.auth/login/aadb2c?post_login_redirect_uri=${profileRedirect}`
  
  const signUpUser = async (userAuthInfo) => {
    console.log('Initializing user', userAuthInfo.userId)
    await new Promise(resolve => {
      userActions.push(userAuthInfo);
      resolve();
    })
    .then(() => {
      console.log('User database updated', userAuthInfo.userId);
      return new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
    })
    .then(() => {
      return userDB.pullUser(userAuthInfo.userId);
    })
      .then(savedUser => {
      console.log('User pulled from database', savedUser);
      userActions.set(savedUser);
    })
    .catch(error => {
      console.log(error);
    });
  }

  const loginUser = async (savedUser) => {
    try {
      // set user info in store
      await userActions.set(savedUser); 
      // set products and survey data in store
      if (savedUser.products && savedUser.products.length > 0) {
        console.log(`Products found in db ${savedUser.products.length}`)
        await productActions.set(savedUser.products);
      }
      if (savedUser.surveyData ) {
        console.log(`SurveyData found in db ${savedUser.surveyData}`)
        await surveyActions.set(savedUser.surveyData);
      }
    } catch (error) { console.log(error); }
  }

  const logoutUser = () => {
    userActions.logout(); 
    window.location.href = `/.auth/logout?post_logout_redirect_uri=${homeRedirect}`;
  };

  useEffect(() => {
    (async () => {
      const userAuthInfo = await getUserAuthInfo();
      if (userAuthInfo) {
        console.log(`User authenticated, logging in ${userAuthInfo}`);
        const savedUser = await userDB.pullUser(userAuthInfo.userId);
        if (savedUser) { await loginUser(savedUser) }
        else { await signUpUser(userAuthInfo); }
      }
      else { console.log('Not logged in'); }
    })();
  }, []);

  return (
    <div className="column is-2">
      <nav className="menu">
        <p className="menu-label">Menu</p>
        <ul className="menu-list">
          <NavLink to="/home" activeClassName="active-link">
            Home
          </NavLink>
          <NavLink to="/about" activeClassName="active-link">
            About
          </NavLink>
        </ul>
      </nav>
      <nav className="menu auth">
        <p className="menu-label">Auth</p>
        <div className="menu-list auth">
          {!loggedIn && <a href={loginURI}>Login</a>}
          {loggedIn && <button onClick={logoutUser}>Logout</button>}
        </div>
      </nav>
      {userInfo && (
        <div>
          <div className="user">
            <Link to="/profile">{userInfo && userInfo.name}</Link>
          </div>
        </div>
      )}
    </div>
  );
};


export default NavBar;
