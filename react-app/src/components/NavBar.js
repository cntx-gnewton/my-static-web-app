import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom'; 

import * as cosmosDB from '../services/cosmos.services';
import { getUserInfo } from '../services/api.userInfo';
import { useManage } from '../store';

const NavBar = () => {
  const providers = ['twitter', 'github', 'aad', 'aadb2c'];
  const redirect = window.location.pathname;
  const { setUser, userInfo } = useManage();
  
  useEffect(() => {
    (async () => {
      const userInfo = await getUserInfo();
      setUser(userInfo);
      // setUser(await getUserInfo()); // dispatch action directly here
      await cosmosDB.list();
    })();
  }, []); // pass an empty array as the dependency array

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
              <a key={provider} href={`/.auth/login/${provider}?post_login_redirect_uri=${redirect}`}>
                {provider}
              </a>
            ))}
          {userInfo && <a href={`/.auth/logout?post_logout_redirect_uri=${redirect}`}>Logout</a>}
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
