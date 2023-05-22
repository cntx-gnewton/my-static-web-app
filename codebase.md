
## About.js

```
import React from 'react';
const About = () => (
  <div className="content-container">
    <div className="content-title-group not-found">
      <h2 className="title">Product Wish List</h2>
      <p>
        This project was created to help represent a fundamental app written
        with React. The shopping theme is used throughout the app.
      </p>
      <br />
      <h2 className="title">Resources</h2>
      <ul>
        <li>
          <a href="https://github.com/MicrosoftDocs/mslearn-staticwebapp">
            Code in GitHub
          </a>
        </li>
      </ul>
    </div>
  </div>
);
export default About;

```

## App.css

```

```

## App.js

```
import React, { Component, lazy, Suspense } from 'react';
import 'bulma/css/bulma.css';
import './styles.scss';
import { Redirect, Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import { HeaderBar, NavBar, NotFound } from './components';
import About from './About';
const Products = withRouter(
  lazy(() => import(/* webpackChunkName: "products" */ './products/Products'))
);
class App extends Component {
  render() {
    return (
      <div>
        <HeaderBar />
        <div className="section columns">
          <NavBar />
          <main className="column">
            <Suspense fallback={<div>Loading...</div>}>
              <Switch>
                <Redirect from="/" exact to="/products" />
                <Route path="/products" component={Products} />
                <Route path="/about" component={About} />
                <Route exact path="**" component={NotFound} />
              </Switch>
            </Suspense>
          </main>
        </div>
      </div>
    );
  }
}
export default App;

```

# components/

## components\ButtonFooter.js

```
import React from 'react';
const ButtonFooter = ({
  label,
  className,
  iconClasses,
  onClick,
  dataIndex,
  dataId,
}) => {
  return (
    <button
      className={'link card-footer-item ' + className}
      aria-label={label}
      tabIndex={0}
      onClick={onClick}
      data-index={dataIndex}
      data-id={dataId}
    >
      <i className={iconClasses} />
      <span>{label}</span>
    </button>
  );
};
export default ButtonFooter;

```

## components\CardContent.js

```
import React from 'react';
const CardContent = ({ name, description }) => (
  <div className="card-content">
    <div className="content">
      <div className="name">{name}</div>
      <div className="description">{description}</div>
    </div>
  </div>
);
export default CardContent;

```

## components\HeaderBar.js

```
import React from 'react';
import HeaderBarBrand from './HeaderBarBrand';
const HeaderBar = () => (
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
export default HeaderBar;

```

## components\HeaderBarBrand.js

```
import React from 'react';
import { NavLink } from 'react-router-dom';
const HeaderBarBrand = () => (
  <div className="navbar-brand">
    <a
      className="navbar-item"
      href="https://reactjs.org/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i className="fab js-logo fa-react fa-2x" aria-hidden="true" />
    </a>
    <NavLink to="/" className="navbar-item nav-home">
      <span className="brand-first">MY</span>
      <span className="brand-second">SHOPPING</span>
      <span className="brand-third">LIST</span>
    </NavLink>
  </div>
);
export default HeaderBarBrand;

```

## components\index.js

```
import ButtonFooter from './ButtonFooter';
import CardContent from './CardContent';
import HeaderBar from './HeaderBar';
import InputDetail from './InputDetail';
import ListHeader from './ListHeader';
import ModalYesNo from './ModalYesNo';
import NavBar from './NavBar';
import NotFound from './NotFound';
export {
  ButtonFooter,
  CardContent,
  HeaderBar,
  InputDetail,
  ListHeader,
  NavBar,
  NotFound,
  ModalYesNo
};

```

## components\InputDetail.js

```
import React from 'react';
const InputDetail = ({ name, value, placeholder, onChange, readOnly }) => (
  <div className="field">
    <label className="label" htmlFor={name}>
      {name}
    </label>
    <input
      name={name}
      className="input"
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      readOnly={!!readOnly}
      onChange={onChange}
    />
  </div>
);
export default InputDetail;

```

## components\ListHeader.js

```
import React from 'react';
import { NavLink } from 'react-router-dom';
const ListHeader = ({ title, handleAdd, handleRefresh, routePath }) => {
  return (
    <div className="content-title-group">
      <NavLink to={routePath}>
        <h2 className="title">{title}</h2>
      </NavLink>
      <button
        className="button add-button"
        onClick={handleAdd}
        aria-label="add"
      >
        <i className="fas fa-plus" aria-hidden="true" />
      </button>
      <button
        className="button refresh-button"
        onClick={handleRefresh}
        aria-label="refresh"
      >
        <i className="fas fa-sync" aria-hidden="true" />
      </button>
    </div>
  );
};
export default ListHeader;

```

## components\Modal.js

```
import { Component } from 'react';
import { createPortal } from 'react-dom';
const modalRoot = document.getElementById('modal');
class Modal extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }
  componentDidMount() {
    modalRoot.appendChild(this.el);
  }
  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }
  render() {
    return createPortal(this.props.children, this.el);
  }
}
export default Modal;

```

## components\ModalYesNo.js

```
import React from 'react';
import Modal from './Modal';
const ModalYesNo = ({ message, onYes, onNo }) => (
  <Modal>
    <div className="modal is-active">
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Confirm</p>
        </header>
        <section className="modal-card-body">{message}</section>
        <footer className="modal-card-foot card-footer">
          <button className="button modal-no" onClick={onNo}>
            No
          </button>
          <button className="button is-primary modal-yes" onClick={onYes}>
            Yes
          </button>
        </footer>
      </div>
    </div>
  </Modal>
);
export default ModalYesNo;

```

## components\NavBar.js

```
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
const NavBar = (props) => {
  const providers = ['twitter', 'github', 'aad'];
  const redirect = window.location.pathname;
  const [userInfo, setUserInfo] = useState();
  useEffect(() => {
    (async () => {
      setUserInfo(await getUserInfo());
    })();
  }, []);
  async function getUserInfo() {
    try {
      const response = await fetch('/.auth/me');
      const payload = await response.json();
      const { clientPrincipal } = payload;
      return clientPrincipal;
    } catch (error) {
      console.error('No profile could be found');
      return undefined;
    }
  }
  return (
    <div className="column is-2">
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
```

## components\NotFound.js

```
import React from 'react';
const NotFound = () => (
  <div className="content-container">
    <div className="content-title-group not-found">
      <i className="fas fa-exclamation-triangle" aria-hidden="true" />
      &nbsp;
      <span className="title">{`These aren't the bits you're looking for`}</span>
    </div>
  </div>
);
export default NotFound;

```

## index.css

```
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

```

## index.js

```
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';
import app, { productSaga } from './store';
// create and configure reduxer middleware ( saga is a middleware )
const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ 
 compose;
const store = createStore(
  app,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);
sagaMiddleware.run(productSaga);
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

```

# products/

## products\ProductDetail.js

```
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { ButtonFooter, InputDetail } from '../components';
function ProductDetail({
  product: initProduct,
  handleCancelProduct,
  handleSaveProduct,
  history,
}) {
  const [product, setProduct] = useState(Object.assign({}, initProduct));
  useEffect(() => {
    if (!product) {
      history.push('/products'); // no product, bail out of Details
    }
  }, [product, history]);
  function handleSave() {
    const chgProduct = { ...product, id: product.id 
 null };
    handleSaveProduct(chgProduct);
  }
  function handleNameChange(e) {
    setProduct({ ...product, name: e.target.value });
  }
  function handleDescriptionChange(e) {
    setProduct({ ...product, description: e.target.value });
  }
  function handleQuantityChange(e) {
    setProduct({ ...product, quantity: e.target.value });
  }
  return (
    <div className="card edit-detail">
      <header className="card-header">
        <p className="card-header-title">
          {product.name}
          &nbsp;
        </p>
      </header>
      <div className="card-content">
        <div className="content">
          {product.id && (
            <InputDetail name="id" value={product.id} readOnly="true" />
          )}
          <InputDetail
            name="name"
            value={product.name}
            placeholder="Oranges"
            onChange={handleNameChange}
          />
          <InputDetail
            name="description"
            value={product.description}
            placeholder="box"
            onChange={handleDescriptionChange}
          />
          <div className="field">
            <label className="label" htmlFor="quantity">
              quantity
            </label>
            <input
              name="quantity"
              className="input"
              type="number"
              min="1"
              max="100"
              defaultValue={product.quantity}
              placeholder="1"
              onChange={handleQuantityChange}
            />
          </div>
        </div>
      </div>
      <footer className="card-footer ">
        <ButtonFooter
          className="cancel-button"
          iconClasses="fas fa-undo"
          onClick={handleCancelProduct}
          label="Cancel"
        />
        <ButtonFooter
          className="save-button"
          iconClasses="fas fa-save"
          onClick={handleSave}
          label="Save"
        />
      </footer>
    </div>
  );
}
export default withRouter(ProductDetail);

```

## products\ProductList.js

```
import React from 'react';
import { withRouter } from 'react-router';
import { ButtonFooter, CardContent } from '../components';
function ProductList({
  handleDeleteProduct,
  handleSelectProduct,
  products,
  history,
}) {
  function selectProduct(e) {
    const product = getSelectedProduct(e);
    handleSelectProduct(product);
    history.push(`/products/${product.id}`);
  }
  function deleteProduct(e) {
    const product = getSelectedProduct(e);
    handleDeleteProduct(product);
  }
  function getSelectedProduct(e) {
    const index = +e.currentTarget.dataset.index;
    return products[index];
  }
  return (
    <div>
      {products.length === 0 && <div>Loading data ...</div>}
      <ul className="list">
        {products.map((product, index) => (
          <li key={product.id} role="presentation">
            <div className="card">
              <CardContent
                name={product.name}
                description={product.description}
              />
              <footer className="card-footer">
                <ButtonFooter
                  className="delete-item"
                  iconClasses="fas fa-trash"
                  onClick={deleteProduct}
                  label="Delete"
                  dataIndex={index}
                  dataId={product.id}
                />
                <ButtonFooter
                  className="edit-item"
                  iconClasses="fas fa-edit"
                  onClick={selectProduct}
                  label="Edit"
                  dataIndex={index}
                  dataId={product.id}
                />
              </footer>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default withRouter(ProductList);

```

## products\Products.js

```
import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { ListHeader, ModalYesNo } from '../components';
import ProductDetail from './ProductDetail';
import ProductList from './ProductList';
import useProducts from './useProducts';
const captains = console;
function Products({ history }) {
  const [productToDelete, setProductToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {
    addProduct,
    deleteProduct,
    getProducts,
    products,
    selectProduct,
    selectedProduct,
    updateProduct,
  } = useProducts();
  useEffect(() => {
    getProducts();
  }, [getProducts]);
  function addNewProduct() {
    selectProduct({});
    history.push('/products/0');
  }
  function handleCancelProduct() {
    history.push('/products');
    selectProduct(null);
    setProductToDelete(null);
  }
  function handleDeleteProduct(product) {
    selectProduct(null);
    setProductToDelete(product);
    setShowModal(true);
  }
  function handleSaveProduct(product) {
    if (selectedProduct && selectedProduct.name) {
      captains.log(product);
      updateProduct(product);
    } else {
      addProduct(product);
    }
    handleCancelProduct();
  }
  function handleCloseModal() {
    setShowModal(false);
  }
  function handleDeleteFromModal() {
    setShowModal(false);
    deleteProduct(productToDelete);
    handleCancelProduct();
  }
  function handleSelectProduct(selectedProduct) {
    selectProduct(selectedProduct);
    captains.log(`you selected ${selectedProduct.name}`);
  }
  function handleRefresh() {
    handleCancelProduct();
    getProducts();
  }
  return (
    <div className="content-container">
      <ListHeader
        title="Products"
        handleAdd={addNewProduct}
        handleRefresh={handleRefresh}
        routePath="/products"
      />
      <div className="columns is-multiline is-variable">
        <div className="column is-8">
          <Switch>
            <Route
              exact
              path="/products"
              component={() => (
                <ProductList
                  products={products}
                  selectedProduct={selectedProduct}
                  handleSelectProduct={handleSelectProduct}
                  handleDeleteProduct={handleDeleteProduct}
                />
              )}
            />
            <Route
              exact
              path="/products/:id"
              component={() => {
                return (
                  <ProductDetail
                    product={selectedProduct}
                    handleCancelProduct={handleCancelProduct}
                    handleSaveProduct={handleSaveProduct}
                  />
                );
              }}
            />
          </Switch>
        </div>
      </div>
      {showModal && (
        <ModalYesNo
          message={`Would you like to delete ${productToDelete.name}?`}
          onNo={handleCloseModal}
          onYes={handleDeleteFromModal}
        />
      )}
    </div>
  );
}
export default Products;

```

## products\useProducts.js

```
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addProductAction,
  deleteProductAction,
  loadProductsAction,
  selectProductAction,
  updateProductAction,
} from '../store';
/** Custom hook for accessing Product state in redux store */
function useProducts() {
  const dispatch = useDispatch();
  return {
    // Selectors
    products: useSelector((state) => state.products.data),
    selectedProduct: useSelector((state) => state.selectedProduct),
    // Dispatchers
    // Wrap any dispatcher that could be called within a useEffect() in a useCallback()
    addProduct: (product) => dispatch(addProductAction(product)),
    deleteProduct: (product) => dispatch(deleteProductAction(product)),
    getProducts: useCallback(() => dispatch(loadProductsAction()), [dispatch]), // called within a useEffect()
    selectProduct: (product) => dispatch(selectProductAction(product)),
    updateProduct: (product) => dispatch(updateProductAction(product)),
  };
}
export default useProducts;

```

## serviceWorker.js

```
/* eslint no-console: "off" */
// This optional code is used to register a service worker.
// register() is not called by default.
// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.
// To learn more about the benefits of this model and instructions on how to
// opt-in, read http://bit.ly/CRA-PWA.
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' 
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' 
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]
2[0-4][0-9]
[01]?[0-9][0-9]?)){3}$/
    )
);
export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);
        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit http://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See http://bit.ly/CRA-PWA.'
              );
              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');
              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}
function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl)
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      if (
        response.status === 404 
        response.headers.get('content-type').indexOf('javascript') === -1
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}

```

## staticwebapp.config.json

```
{
  "routes": [
    {
      "route": "/api/products/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["*.{css,scss,js,png,gif,ico,jpg,svg}"]
  }
}
```

# store/

## store\action-utils.js

```
export const parseList = response => {
  if (response.status !== 200) throw Error(response.message);
  let list = response.data;
  if (typeof list !== 'object') {
    list = [];
  }
  return list;
};
export const parseItem = (response, code) => {
  if (response.status !== code) throw Error(response.message);
  let item = response.data;
  if (typeof item !== 'object') {
    item = undefined;
  }
  return item;
};

```

## store\config.js

```
const API = process.env.REACT_APP_API 
 'api';
export { API as default };

```

## store\index.js

```
import { combineReducers } from 'redux';
import { selectedProductReducer, productsReducer } from './product.reducer';
export * from './product.actions';
export * from './product.reducer';
export * from './product.saga';
const store = combineReducers({
  products: productsReducer,
  selectedProduct: selectedProductReducer,
});
export default store;

```

## store\product.actions.js

```
export const LOAD_PRODUCT = '[Products] LOAD_PRODUCT';
export const LOAD_PRODUCT_SUCCESS = '[Products] LOAD_PRODUCT_SUCCESS';
export const LOAD_PRODUCT_ERROR = '[Products] LOAD_PRODUCT_ERROR';
export const UPDATE_PRODUCT = '[Products] UPDATE_PRODUCT';
export const UPDATE_PRODUCT_SUCCESS = '[Products] UPDATE_PRODUCT_SUCCESS';
export const UPDATE_PRODUCT_ERROR = '[Products] UPDATE_PRODUCT_ERROR';
export const DELETE_PRODUCT = '[Products] DELETE_PRODUCT';
export const DELETE_PRODUCT_SUCCESS = '[Products] DELETE_PRODUCT_SUCCESS';
export const DELETE_PRODUCT_ERROR = '[Products] DELETE_PRODUCT_ERROR';
export const ADD_PRODUCT = '[Products] ADD_PRODUCT';
export const ADD_PRODUCT_SUCCESS = '[Products] ADD_PRODUCT_SUCCESS';
export const ADD_PRODUCT_ERROR = '[Products] ADD_PRODUCT_ERROR';
export const SELECT_PRODUCT = '[Product] SELECT_PRODUCT';
export const selectProductAction = (product) => ({
  type: SELECT_PRODUCT,
  payload: product,
});
export const loadProductsAction = () => ({ type: LOAD_PRODUCT });
export const updateProductAction = (product) => ({
  type: UPDATE_PRODUCT,
  payload: product,
});
export const deleteProductAction = (product) => ({
  type: DELETE_PRODUCT,
  payload: product,
});
export const addProductAction = (product) => ({
  type: ADD_PRODUCT,
  payload: product,
});

```

## store\product.api.js

```
import axios from 'axios';
import { parseItem, parseList } from './action-utils';
import API from './config';
const captains = console;
export const deleteProductApi = async (product) => {
  const response = await axios.delete(`${API}/products/${product.id}`);
  return parseItem(response, 200);
};
export const updateProductApi = async (product) => {
  captains.log(product.id);
  const response = await axios.put(`${API}/products/${product.id}`, product);
  return parseItem(response, 200);
};
export const addProductApi = async (product) => {
  const response = await axios.post(`${API}/products`, product);
  return parseItem(response, 201);
};
export const loadProductsApi = async () => {
  const response = await axios.get(`${API}/products`);
  return parseList(response, 200);
};

```

## store\product.reducer.js

```
import {
  SELECT_PRODUCT,
  LOAD_PRODUCT_SUCCESS,
  LOAD_PRODUCT,
  LOAD_PRODUCT_ERROR,
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_ERROR,
  DELETE_PRODUCT,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_ERROR,
  ADD_PRODUCT,
  ADD_PRODUCT_SUCCESS,
  ADD_PRODUCT_ERROR,
} from './product.actions';
let initState = {
  loading: false,
  data: [],
  error: void 0,
};
export const productsReducer = (state = initState, action) => {
  switch (action.type) {
    case LOAD_PRODUCT:
      return { ...state, loading: true, error: '' };
    case LOAD_PRODUCT_SUCCESS:
      return { ...state, loading: false, data: [...action.payload] };
    case LOAD_PRODUCT_ERROR:
      return { ...state, loading: false, error: action.payload };
    case UPDATE_PRODUCT:
      return {
        ...state,
        data: state.data.map((h) => {
          if (h.id === action.payload.id) {
            state.loading = true;
          }
          return h;
        }),
      };
    case UPDATE_PRODUCT_SUCCESS:
      return modifyProductState(state, action.payload);
    case UPDATE_PRODUCT_ERROR:
      return { ...state, loading: false, error: action.payload };
    case DELETE_PRODUCT: {
      return {
        ...state,
        loading: true,
        data: state.data.filter((h) => h !== action.payload),
      };
    }
    case DELETE_PRODUCT_SUCCESS: {
      const result = { ...state, loading: false };
      return result;
    }
    case DELETE_PRODUCT_ERROR: {
      return {
        ...state,
        data: [...state.data, action.payload.requestData],
        loading: false,
      };
    }
    case ADD_PRODUCT: {
      return { ...state, loading: true };
    }
    case ADD_PRODUCT_SUCCESS: {
      return {
        ...state,
        loading: false,
        data: [...state.data, { ...action.payload }],
      };
    }
    case ADD_PRODUCT_ERROR: {
      return { ...state, loading: false };
    }
    default:
      return state;
  }
};
const modifyProductState = (productState, productChanges) => {
  return {
    ...productState,
    loading: false,
    data: productState.data.map((h) => {
      if (h.id === productChanges.id) {
        return { ...h, ...productChanges };
      } else {
        return h;
      }
    }),
  };
};
let initialSelectedProduct = null;
export const selectedProductReducer = (
  state = initialSelectedProduct,
  action
) => {
  switch (action.type) {
    case SELECT_PRODUCT:
      return action.payload ? { ...action.payload } : null;
    default:
      return state;
  }
};

```

## store\product.saga.js

```
import { put, takeEvery, call, all } from 'redux-saga/effects';
import {
  LOAD_PRODUCT,
  LOAD_PRODUCT_SUCCESS,
  LOAD_PRODUCT_ERROR,
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_ERROR,
  DELETE_PRODUCT,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_ERROR,
  ADD_PRODUCT,
  ADD_PRODUCT_SUCCESS,
  ADD_PRODUCT_ERROR,
} from './product.actions';
import {
  addProductApi,
  deleteProductApi,
  loadProductsApi,
  updateProductApi,
} from './product.api';
export function* loadingProductsAsync() {
  try {
    const data = yield call(loadProductsApi);
    const productes = [...data];
    yield put({ type: LOAD_PRODUCT_SUCCESS, payload: productes });
  } catch (err) {
    yield put({ type: LOAD_PRODUCT_ERROR, payload: err.message });
  }
}
export function* watchLoadingProductsAsync() {
  yield takeEvery(LOAD_PRODUCT, loadingProductsAsync);
}
export function* updatingProductAsync({ payload }) {
  try {
    const data = yield call(updateProductApi, payload);
    const updatedProduct = data;
    yield put({ type: UPDATE_PRODUCT_SUCCESS, payload: updatedProduct });
  } catch (err) {
    yield put({ type: UPDATE_PRODUCT_ERROR, payload: err.message });
  }
}
export function* watchUpdatingProductAsync() {
  yield takeEvery(UPDATE_PRODUCT, updatingProductAsync);
}
export function* deletingProductAsync({ payload }) {
  try {
    yield call(deleteProductApi, payload);
    yield put({ type: DELETE_PRODUCT_SUCCESS, payload: null });
  } catch (err) {
    yield put({ type: DELETE_PRODUCT_ERROR, payload: err.message });
  }
}
export function* watchDeletingProductAsync() {
  yield takeEvery(DELETE_PRODUCT, deletingProductAsync);
}
export function* addingProductAsync({ payload }) {
  try {
    const data = yield call(addProductApi, payload);
    const addedProduct = data;
    yield put({ type: ADD_PRODUCT_SUCCESS, payload: addedProduct });
  } catch (err) {
    yield put({ type: ADD_PRODUCT_ERROR, payload: err.message });
  }
}
export function* watchAddingProductAsync() {
  yield takeEvery(ADD_PRODUCT, addingProductAsync);
}
export function* productSaga() {
  yield all([
    watchLoadingProductsAsync(),
    watchUpdatingProductAsync(),
    watchDeletingProductAsync(),
    watchAddingProductAsync(),
  ]);
}

```

## styles.scss

```
$vue: #42b883;
$vue-light: #42b883;
$angular: #b52e31;
$angular-light: #eb7a7c;
$react: #00b3e6;
$react-light: #61dafb;
$primary: $react;
$primary-light: $react-light;
$link: $primary; // #00b3e6; // #ff4081;
$shade-light: #fafafa;
@import 'bulma/bulma.sass';
.menu-list .active-link,
.menu-list .router-link-active {
  color: #fff;
  background-color: $link;
}
.not-found {
  i {
    font-size: 20px;
    margin-right: 8px;
  }
  .title {
    letter-spacing: 0px;
    font-weight: normal;
    font-size: 24px;
    text-transform: none;
  }
}
header {
  font-weight: bold;
  font-family: Arial;
  span {
    letter-spacing: 0px;
    &.brand-first {
      color: #fff;
    }
    &.brand-second {
      color: #ccc;
    }
    &.brand-third {
      color: $primary-light;
    }
  }
  .navbar-item.nav-home {
    border: 3px solid transparent;
    border-radius: 0%;
    &:hover {
      border-right: 3px solid $primary-light;
      border-left: 3px solid $primary-light;
    }
  }
  .fab {
    font-size: 24px;
    &.js-logo {
      color: $primary-light;
    }
  }
  .buttons {
    i.fab {
      color: #fff;
      margin-left: 20px;
      margin-right: 10px;
      &:hover {
        color: $primary-light;
      }
    }
  }
}
.edit-detail {
  .input[readonly] {
    background-color: $shade-light;
  }
  .input::placeholder {
    color: #ccc;
    font-style: italic;
  }
}
.content-title-group {
  margin-bottom: 16px;
  h2 {
    border-left: 16px solid $primary;
    border-bottom: 2px solid $primary;
    padding-left: 8px;
    padding-right: 16px;
    display: inline-block;
    text-transform: uppercase;
    color: #555;
    letter-spacing: 0px;
    &:hover {
      color: $link;
    }
  }
  button.button {
    border: 0;
    color: #999;
    &:hover {
      color: $link;
    }
  }
}
ul.list {
  box-shadow: none;
}
div.card-content {
  background-color: $shade-light;
  .name {
    font-size: 28px;
    color: #000;
  }
  .description {
    font-size: 20px;
    color: #999;
  }
  background-color: $shade-light;
}
.card {
  margin-bottom: 2em;
}
label.label {
  font-weight: normal;
}
p.card-header-title {
  background-color: $primary;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: #fff;
  display: block;
  padding-left: 24px;
}
.card-footer button {
  font-size: 16px;
  i {
    margin-right: 10px;
  }
  color: #888;
  &:hover {
    color: $link;
  }
}
.modal-card-foot button {
  display: inline-block;
  width: 80px;
}
.modal-card-head,
.modal-card-body {
  text-align: center;
}
.field {
  margin-bottom: 0.75rem;
}
.navbar-burger {
  margin-left: auto;
}
button.link {
  background: none;
  border: none;
  cursor: pointer;
}

```
