/* eslint-disable no-unused-vars */
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

  async pushUser(userAuthInfo) {
      console.log('db.pushUser', userAuthInfo)
      const user = {
          id: userAuthInfo.userId,
          displayName: userAuthInfo.displayName,
          products: [],
          surveyData: null,
      };
      const { resource: insertedItem } = await this.client
          .database(this.databaseId).container(this.containerId)
          .items.upsert(user);
      console.log(`Created user :${user.displayName} | ${user.id}\n`);
      console.log('Inserted item:', insertedItem);
  }
  
  async pullUser(userId) {
    console.log(`db.pullUser: ${userId}`);
    try {
      const { resource: user } = await this.client
        .database(this.databaseId).container(this.containerId)
        .item(userId)
        .read();
      console.log(`^: ${user}`);
      return user;
    } catch (error) {
      console.log('db.pullUser: error', error.message)
    }
  }
  async deleteUser(userId) {
    await this.client
        .database(this.databaseId).container(this.containerId)
        .item(userId)
      .delete();
    
    console.log(`Deleted user with id:\n${userId}\n`);
  }
  
  async userExists(userId) {
    console.log(`db.userExists: ${userId}`);
    try {
      const user = await this.pullUser(userId);
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
  async pullProducts(userId) {
    console.log(`db.pullProducts: ${userId}`);
    try {
      const { resource: user } = await this.client
        .database(this.databaseId).container(this.containerId)
        .item(userId)
        .read();

      return user.products || null;
    } catch (error) {
      console.error(`Error getting products for user ${userId}:`, error);
      return null;
    }
  }
  async pushProducts(userId, products) {
    console.log('db.pushProducts', userId, products)
    try {
      const { resource: user } = await this.client
        .database(this.databaseId).container(this.containerId)
        .item(userId)
        .read();
      
      for (const product of products) {
        user.products.push(product);
      }
      // eslint-disable-next-line no-unused-vars
      const { item } = await this.client
        .database(this.databaseId).container(this.containerId)
        .item(userId)
        .replace(user);

    } catch (error) {
      console.error(`Error getting products for user ${userId}:`, error);
    }
  }
  
  async deleteProducts(userId) {
    console.log(`db.deleteProducts: ${userId}`);
    try {
        const { resource: user } = await this.client
        .database(this.databaseId).container(this.containerId)
            .item(userId).read();
        user.products = [];

        const { item } = await this.client
        .database(this.databaseId).container(this.containerId)
            .item(userId).replace(user);
        console.error(`Deleted user products for user: ${userId}:`)

    } catch (error) {console.error(`Error deleting products for user ${userId}:`, error);}
    }

  async productsExist(userId) {
      console.log(`db.productsExist: ${userId}`);
        const products = await this.pullProducts(userId);
        return products && products.length > 0 
  }
  
  async pushSurveyData(userId, surveyData) {

    const { resource: user } = await this.client
    .database(this.databaseId).container(this.containerId)
      .item(userId).read();
    console.log(`db.pushSurveyData: userId:${userId} | | user:${user} | surveyData:${surveyData}`);
    // Add survey data to the user document
    user.surveyData = surveyData;
    const { item } = await this.client
      .database(this.databaseId).container(this.containerId)
      .item(userId)
      .replace(user);
  }

  async createContainer() {
    try {
      const { partitionKey } = this.partitionKey
      const { container } = await this.client
        .database(this.databaseId)
        .containers.createIfNotExists({
          id: this.containerId, partitionKey
        })
      console.log(`Created container:\n${this.containerId}\n`)
    } catch (error) {
      console.error(`Error creating container ${this.containerId}:`, error)
      return false;
    }
  }
    async pullContainer() {
        const { resource: containerDefinition } = await this.client
            .database(this.databaseId).container(this.containerId)
            .read()
        console.log(`Reading container:\n${containerDefinition.id}\n`)
    }
    async deleteContainer() {
        await this.client
            .database(this.databaseId).container(this.containerId)
            .delete()
        console.log(`Deleted container:\n${this.containerId}\n`)
    }
    async createDatabase() {
        const { database } = await this.client.databases.createIfNotExists({
            id: this.databaseId
        })
        console.log(`Created database:\n${database.id}\n`)
    }
    async pullDatabase() {
        const { resource: databaseDefinition } = await this.client
            .database(this.databaseId).read()
        console.log(`Reading database:\n${databaseDefinition.id}\n`)
    }
    async deleteDatabase() {
        await this.client.database(this.databaseId).delete()
        console.log(`Deleted database:\n${this.databaseId}\n`)
    }
    async listUsers() {
      console.log(`Querying container:\n${this.containerId}`);
      const querySpec = {
        query: 'SELECT r.id, r.name, r.products FROM root r',
      };
      try {
        const { resources: results } = await this.client
          .database(this.databaseId).container(this.containerId)
          .items.query(querySpec)
          .fetchAll();
        console.table(results);
      } catch (error) {
        console.error('Error in list(): ' + error);
      }
    }
}


export default DatabaseClient;