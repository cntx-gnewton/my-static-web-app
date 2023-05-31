// ./components/HeaderBar.js
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import HeaderBarBrand from './HeaderBarBrand';
import { useUserDB, useStore } from '../services';

const HeaderBar = () => {
  const { userDB } = useUserDB(); // get userDB from useUserDB
  const { dispatchers } = useStore(); // get dispatchers and selectors from useStore
  const { userInfo, products, userId } = dispatchers(); // get userInfo and userProducts from useStore

  // Define the log functions
  const logUserInfo = () => { console.log(userInfo); }
  const logUserProducts = () => { console.log(products); }
  const logUserList = () => { console.log(userDB.listUsers()); }

  const createDatabase = () => { userDB.createDatabase(); }
  const deleteDatabase = () => { userDB.deleteDatabase(); }
  
  const deleteContainer = () => { userDB.deleteContainer(); }
  const createContainer = () => { userDB.createContainer(); }

  const deleteUser = () => {
    userDB.deleteUser(userId);
  }
  return (
    <header>
      <nav
        className="navbar has-background-dark is-dark"
        role="navigation"
        aria-label="main navigation"
      >
        <HeaderBarBrand />
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Cosmos Services
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={createDatabase}>Create Database</Dropdown.Item>
            <Dropdown.Item onClick={createContainer}>Create Container</Dropdown.Item>
            <Dropdown.Item onClick={deleteDatabase}>Delete Database</Dropdown.Item>
            <Dropdown.Item onClick={deleteContainer}>Delete Container</Dropdown.Item>
            <Dropdown.Item onClick={deleteUser}>Delete User</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            User Info
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {/* <button onClick={userDB.createDatabase}> */}
            <Dropdown.Item onClick={logUserInfo}>Log User Info</Dropdown.Item>
            <Dropdown.Item onClick={logUserProducts}>Log User Products</Dropdown.Item>
            <Dropdown.Item onClick={logUserList}>Log User List</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </nav>
    </header>
  );
};

export default HeaderBar;
