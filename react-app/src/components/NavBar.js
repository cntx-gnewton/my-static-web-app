// Filename: components/NavBar.js
// Description: This file contains the NavBar component which is in charge of logging the user in and out.
import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom'; 
import { getUserAuthInfo } from '../services/api';
import { useStore } from '../store';

const NavBar = () => {
  const profileRedirect = '/profile';
  const homeRedirect = '/home';
  const loginURI = `/.auth/login/aad?post_login_redirect_uri=${profileRedirect}`
  const logoutURI = `/.auth/logout?post_logout_redirect_uri=${homeRedirect}`
  const { user, loginUser, logoutUser } = useStore();
  useEffect(() => {
    (async () => {
      const userAuthInfo = await getUserAuthInfo();
      if (userAuthInfo) { // Check if userAuthInfo is not null or undefined
        console.log('User authenticated, logging in user');
        loginUser(userAuthInfo);
      } else {
        console.log('Not logged in');
      }
    })();
  }, [loginUser]); // Add loginUser to the dependency array

  // useEffect(() => {
  //   console.log('user changed')
  //   if(user) {
  //     console.log('User data:', user);
  //     user.print();
  //   }
  // }, [user]); // This effect will run whenever the 'user' state changes

  const handleLogout = () => {
    // clear user from  store
    logoutUser();
    // redirect to logout URI
    window.location.href = logoutURI;
  };

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
          {!user && <a href={loginURI}>Login</a>}
          {user && <button onClick={handleLogout}>Logout</button>}{/* Add onClick handler to Logout link */}
        </div>
      </nav>
      {user && (
        <div>
          <div className="user">
             <Link to="/profile">{user && user.displayName}</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
