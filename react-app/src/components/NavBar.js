import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom'; 

import { getUserInfo } from '../services/handlers';
import { useStore } from '../store';

const NavBar = () => {
  const providers = ['twitter', 'github', 'aad', 'aadb2c'];
  const profileRedirect = '/profile';
  const homeRedirect = '/home';
  const { initializeUser, logoutUser, userInfo } = useStore(); // get the logout function from useStore
  
  useEffect(() => {
    (async () => {
      const userInfo = await getUserInfo();
      if (userInfo) { // Check if userInfo is not null or undefined
        console.log('User signed in, waiting to initializing user');
        await initializeUser(userInfo);
      } else {
        console.log('Not logged in');
      }
    })();
  }, [initializeUser]); // Add initializeUser to the dependency array


  // Handle logout
  const handleLogout = () => {
    logoutUser(); // clear user data from the store
    // redirect to logout URI
    window.location.href = `/.auth/logout?post_logout_redirect_uri=${homeRedirect}`;
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
          {!userInfo &&
            providers.map((provider) => (
              <a key={provider} href={`/.auth/login/${provider}?post_login_redirect_uri=${profileRedirect}`}>
                {provider}
              </a>
            ))}
          {userInfo && <button onClick={handleLogout}>Logout</button>}{/* Add onClick handler to Logout link */}
        </div>
      </nav>
      {userInfo && (
        <div>
          <div className="user">
             <Link to="/profile">{userInfo && userInfo.userDetails}</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
