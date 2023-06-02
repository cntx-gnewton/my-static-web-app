// ./components/HeaderBar.js
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import HeaderBarBrand from './HeaderBarBrand';
import { useUserDB, useStore } from '../services';
import { getUserAuthInfo } from '../services/api';
const HeaderBar = () => {
  const { userDB } = useUserDB(); // get userDB from useUserDB
  const { selectors } = useStore(); // get dispatchers and selectors from useStore
  const { userInfo, products, userId } = selectors; // get userInfo and userProducts from useStore

  // Define the log functions
  const logUserAuth = () => {console.log(getUserAuthInfo());}
  const logUserInfo = () => { console.log(userInfo); }
  const logUserId = () => { console.log(userId); }
  const logUserProducts = () => { console.log(products); }
  const logUserList = () => { console.log(userDB.listUsers()); }

  const createDatabase = () => { userDB.createDatabase(); }
  const deleteDatabase = () => { userDB.deleteDatabase(); }
  const pullUser = () => { userDB.pullUser(userInfo.userId); }
  const deleteContainer = () => { userDB.deleteContainer(); }
  const createContainer = () => { userDB.createContainer(); }
  const deleteUser = () => { userDB.deleteUser(userInfo.id); }

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
            <Dropdown.Item onClick={createDatabase}>Create Database</Dropdown.Item>
            <Dropdown.Item onClick={pullUser}>Pull User</Dropdown.Item>
            <Dropdown.Item onClick={deleteUser}>Delete User</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            User Info
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {/* <button onClick={userDB.createDatabase}> */}
            <Dropdown.Item onClick={logUserAuth}>Log User Auth</Dropdown.Item>
            <Dropdown.Item onClick={logUserId}>Log User Id</Dropdown.Item>
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
