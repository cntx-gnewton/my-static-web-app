import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom'; 
import * as cosmosDB from '../services/database';
import { connect } from 'react-redux';
import { useSelector } from 'react-redux';


const NavBar = (props) => {
  const providers = ['twitter', 'github', 'aad', 'aadb2c'];
  const redirect = window.location.pathname;
  const userInfo = useSelector(state => state.userInfo);
  // const [userInfo, setUserInfo] = useState(); // https://stackoverflow.com/questions/53165945/what-is-usestate-in-react
  
  useEffect(() => {
    (async () => {
      const userInfo = await getUserInfo();
      props.setUserInfo(userInfo); // dispatch action to Redux store
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
             <Link to="/profile">{userInfo && userInfo.userDetails}</Link>
          </div>
        </div>
      )}
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  setUserInfo: (userInfo) => dispatch({ type: 'SET_USER_INFO', payload: userInfo }),
});
const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});
export default connect(mapStateToProps, mapDispatchToProps)(NavBar);