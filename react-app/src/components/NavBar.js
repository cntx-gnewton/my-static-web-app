import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom'; 
import { getUserAuthInfo } from '../services/api';
import { useStore, useUserDB } from '../services';

const NavBar = () => {
  const { dispatchers, selectors } = useStore();
  const { userActions, productActions } = dispatchers;
  const { userInfo, loggedIn } = selectors;

  // User DB
  const { userDB } = useUserDB();

  const profileRedirect = '/profile';
  const homeRedirect = '/home';
  const loginURI = `/.auth/login/aadb2c?post_login_redirect_uri=${profileRedirect}`

  useEffect(() => {
    (async () => {
      const userAuthInfo = await getUserAuthInfo();
      if (userAuthInfo) { // Check if userAuthInfo is not null or undefined
        console.log(`User authenticated, logging in ${userAuthInfo}`);
        const savedUser = await userDB.pullUser(userAuthInfo.userId);
        console.log(`User ${savedUser ? 'found' : 'not found'} in database`)
        if (savedUser) {
          await userActions.set(savedUser);
          console.log('User set in store', savedUser)
          if (savedUser.products.length > 0) {
            await productActions.set(savedUser.products);
            console.log(`Products set in store ${savedUser.products.length}`)
          }
        } else {
          await userActions.push(userAuthInfo);
          console.log('User updated in database');
        }
      } else {
        console.log('Not logged in');
      }
    })();
  }, []); // Add initializeUser to the dependency array


  // Handle logout
  const handleLogout = () => {
    userActions.logout(); // clear user data from the store
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
          { !loggedIn && <a href={loginURI}>Login</a>}
          { loggedIn && <button onClick={handleLogout}>Logout</button>}
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
