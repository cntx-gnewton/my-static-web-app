// ./components/HeaderBar.js
import React from 'react';
// import { Dropdown } from 'react-bootstrap';
import HeaderBarBrand from './HeaderBarBrand';

const HeaderBar = () => {
  // Define the log functions
  // const logUserInfo = () => { console.log(userInfo); }
  // const logUserProducts = () => { console.log(userProducts); }
  // const logUserList = () => { console.log(userDB.list()); }

  // const createDatabase = () => { userDB.createDatabase(); }
  // const deleteDatabase = () => { userDB.deleteDatabase(); }
  
  // const deleteContainer = () => { userDB.deleteContainer(); }
  // const createContainer = () => { userDB.createContainer(); }
  // const deleteUser = () => {
  //   userDB.deleteUser(userInfo.userId);
  //   userDB.list();
  // }
  return (
    <header>
      <nav
        className="navbar has-background-dark is-dark"
        role="navigation"
        aria-label="main navigation"
      >
        <HeaderBarBrand />
      </nav>
    </header>
  );
};

export default HeaderBar;
