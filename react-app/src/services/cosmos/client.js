// /src/services/cosmos/client.js
// Description: This file defines the DatabaseClient class, which is used to manage database interactions.

import { CosmosClient } from '@azure/cosmos';

class DatabaseClient {
  constructor(config) {
    this.databaseId = config.database.id;
    this.containerId = config.container.id;
    this.partitionKey = { kind: 'Hash', paths: ['/partitionKey'] };
    this.client = new CosmosClient({
      endpoint: config.endpoint,
      key: config.key,
      userAgentSuffix: 'CosmosDBJavascriptQuickstart'
    });
  }

  async getUser(userId) {
    const { resource: user } = await this.client
      .database(this.databaseId)
      .container(this.containerId)
      .item(userId)
      .read();
    return user;
    }
    
  async userExists(userId) {
    try {
      const user = await this.getUser(userId);
      return !!user;  // convert to boolean: true if user exists, false otherwise
    } catch (error) {
      if (error.code === 404) {
        // user does not exist
        return false;
      } else {
        // some other error occurred
        throw error;
      }
    }
  }

  async getProducts(userId) {
    try {
      const { resource: user } = await this.client
        .database(this.databaseId)
        .container(this.containerId)
        .item(userId)
        .read();

      return user.products || null;
    } catch (error) {
      console.error(`Error getting products for user ${userId}:`, error);
      return null;
    }
  }
  async addProduct(userId, product) {
    try {
      const { resource: user } = await this.client
        .database(this.databaseId).container(this.containerId)
        .item(userId)
        .read();
      user.products.push(product);
      // eslint-disable-next-line no-unused-vars
      const { item } = await this.client
        .database(this.databaseId).container(this.containerId)
        .item(userId)
        .replace(user);

    } catch (error) {
      console.error(`Error getting products for user ${userId}:`, error);
    }
  }
}

export default DatabaseClient;