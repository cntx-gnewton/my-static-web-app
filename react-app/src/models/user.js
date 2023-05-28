// src/models/user.js
// Description: This file defines the User class, which is used to manage user data and interactions with the database.

import { DatabaseClient, databaseConfigs } from '../services/cosmos/';
const userConfig = databaseConfigs.user;
const userDB = new DatabaseClient(userConfig);
import { runProductPipeline } from '../services/api';

class User {
  constructor(clientPrincipal) {
    console.log(userConfig)
    this.displayName = clientPrincipal.userDetails;
    this.details = {
        emails: clientPrincipal.claims.emails,
        roles: clientPrincipal.UserRoles,
        identityProvider: clientPrincipal.identityProvider,
    },
    this.data = {
      id: clientPrincipal.userId,
      name: clientPrincipal.userDetails,
      products: []
    };
  }

  async init() {
    let userExists = await userDB.userExists(this.data.id);
    if (!userExists) {
      await userDB.createUser(this.data);
      userExists = true;
    }
    if (userExists) {
      this.data = await this.fetchInfo();
      if (this.data && this.data.products) {
        this.data.products = await this.fetchProducts();
      }
    }
  }

  Data() {
    return this.data;
  }
  hasProducts() {
    this.hasProducts = this.data.products && this.data.products.length > 0;
    return this.hasProducts
  }
  async fetchInfo() {return await userDB.getUser(this.data.id);}
  async fetchProducts() {return await userDB.getProducts(this.data.id);;}

  async addProducts(products) {
    await userDB.addUserProducts(this.data.id, products);
    return this.fetchProducts();
  }

  async generateProducts(file) {
    const products = await runProductPipeline(file);
    await userDB.addUserProducts(this.data.id, products);
    return this.fetchProducts();
  }

  print() {
    console.log('User: ', this);
  }
  // Similarly define other user related methods
  // ...
}

export default User;
