import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import * as cosmosDB from '../services/database';

const NavBar = (props) => {
  const providers = ['twitter', 'github', 'aad'];
  const redirect = window.location.pathname;
  const [userInfo, setUserInfo] = useState(); // https://stackoverflow.com/questions/53165945/what-is-usestate-in-react

  useEffect(() => {
    (async () => {
      setUserInfo(await getUserInfo());
      await cosmosDB.list();
    })();
  }, []);

  async function getUserInfo() {
    try {
      const response = await fetch('/.auth/me');
      const payload = await response.json();
      const { clientPrincipal } = payload;
      return clientPrincipal;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('No profile could be found');
      return undefined;
    }
  }
  // async function list() {

  //   const query = `
  //       {
  //         people {
  //           items {
  //             id
  //             Name
  //           }
  //         }
  //       }`;
        
  //   const endpoint = '/data-api/graphql';
  //   const response = await fetch(endpoint, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ query: query })
  //   });
  //   try {
  //     const result = await response.json();
  //     console.table(result.data.people.items);
  //   }
  //   catch (error) {
  //     console.error('Error list()'+error);
  //   }
  // }

  return (
    <div className="column is-2">
      {/* <button  onClick={ list() }>List</button> */}
      <nav className="menu">
        <p className="menu-label">Menu</p>
        <ul className="menu-list">
          <NavLink to="/products" activeClassName="active-link">
            Products
          </NavLink>
          <NavLink to="/about" activeClassName="active-link">
            About
          </NavLink>
        </ul>
        {props.children}
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
            <p>Welcome</p>
            <p>{userInfo && userInfo.userDetails}</p>
            <p>{userInfo && userInfo.identityProvider}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;